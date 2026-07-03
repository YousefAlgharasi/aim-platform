import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/config/app_config.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../../core/networking/backend_api_paths.dart';

class ApiEndpointDef {
  final String category;
  final String name;
  final String method;
  final String path;
  final bool requiresAuth;
  final String? defaultBody;

  const ApiEndpointDef({
    required this.category,
    required this.name,
    required this.method,
    required this.path,
    this.requiresAuth = true,
    this.defaultBody,
  });
}

class EndpointTesterPage extends ConsumerStatefulWidget {
  const EndpointTesterPage({super.key});

  @override
  ConsumerState<EndpointTesterPage> createState() => _EndpointTesterPageState();
}

class _EndpointTesterPageState extends ConsumerState<EndpointTesterPage> {
  final Map<String, String> _responses = {};
  final Map<String, bool> _loading = {};

  // Define some representative endpoints from all categories
  final List<ApiEndpointDef> endpoints = [
    // Health
    const ApiEndpointDef(category: 'Health', name: 'Health Check', method: 'GET', path: '/health', requiresAuth: false),
    const ApiEndpointDef(category: 'Health', name: 'Version Check', method: 'GET', path: '/version', requiresAuth: false),
    
    // Auth
    const ApiEndpointDef(category: 'Auth', name: 'Login', method: 'POST', path: BackendApiPaths.authLogin, requiresAuth: false, defaultBody: '{"email":"test@example.com","password":"password123"}'),
    const ApiEndpointDef(category: 'Auth', name: 'Get Me', method: 'GET', path: BackendApiPaths.authMe),
    const ApiEndpointDef(category: 'Auth', name: 'Logout', method: 'POST', path: BackendApiPaths.authLogout),

    // Profile
    const ApiEndpointDef(category: 'Profile', name: 'Get Profile', method: 'GET', path: BackendApiPaths.profileMe),

    // Curriculum
    const ApiEndpointDef(category: 'Curriculum', name: 'List Courses', method: 'GET', path: BackendApiPaths.curriculumCourses),
    
    // Placement
    const ApiEndpointDef(category: 'Placement', name: 'Active Placement', method: 'GET', path: BackendApiPaths.placementActive),
    
    // AIM Engine
    const ApiEndpointDef(category: 'AIM Engine', name: 'Skill States', method: 'GET', path: '/aim/students/me/skill-states'),
    const ApiEndpointDef(category: 'AIM Engine', name: 'Recommendations', method: 'GET', path: '/aim/students/me/recommendations'),

    // AI Teacher
    const ApiEndpointDef(category: 'AI Teacher', name: 'List Sessions', method: 'GET', path: BackendApiPaths.aiTeacherSessions),

    // Assessments
    const ApiEndpointDef(category: 'Assessments', name: 'List Assessments', method: 'GET', path: BackendApiPaths.studentAssessments),
    const ApiEndpointDef(category: 'Assessments', name: 'Deadlines', method: 'GET', path: BackendApiPaths.studentAssessmentDeadlines),

    // Analytics
    const ApiEndpointDef(category: 'Analytics', name: 'Analytics Summary', method: 'GET', path: BackendApiPaths.studentAnalyticsSummary),

    // Notifications
    const ApiEndpointDef(category: 'Notifications', name: 'Preferences', method: 'GET', path: BackendApiPaths.notificationPreferences),
    const ApiEndpointDef(category: 'Notifications', name: 'Inbox', method: 'GET', path: BackendApiPaths.notificationInbox),
  ];

  Future<void> _executeRequest(ApiEndpointDef endpoint) async {
    final l10n = AppLocalizations.of(context);
    final key = endpoint.name;
    setState(() {
      _loading[key] = true;
      _responses[key] = l10n.commonLoading;
    });

    try {
      final config = AppConfig.fromEnvironment();
      final uri = Uri.parse('${config.backendApiBaseUrl}${endpoint.path}');

      final headers = <String, String>{
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (endpoint.requiresAuth) {
        final token = ref.read(authFlowProvider).accessToken;
        if (token != null && token.isNotEmpty) {
          headers['Authorization'] = 'Bearer $token';
        } else {
          setState(() {
            _responses[key] = l10n.devToolsNoAuthTokenError;
            _loading[key] = false;
          });
          return;
        }
      }

      http.Response response;
      final startTime = DateTime.now();

      switch (endpoint.method.toUpperCase()) {
        case 'GET':
          response = await http.get(uri, headers: headers);
          break;
        case 'POST':
          response = await http.post(uri, headers: headers, body: endpoint.defaultBody);
          break;
        case 'PATCH':
          response = await http.patch(uri, headers: headers, body: endpoint.defaultBody);
          break;
        case 'DELETE':
          response = await http.delete(uri, headers: headers);
          break;
        default:
          throw Exception('Unsupported method');
      }

      final latency = DateTime.now().difference(startTime).inMilliseconds;
      
      String formattedBody;
      try {
        final json = jsonDecode(response.body);
        formattedBody = const JsonEncoder.withIndent('  ').convert(json);
      } catch (_) {
        formattedBody = response.body;
      }

      setState(() {
        _responses[key] = 'Status: ${response.statusCode} | Latency: ${latency}ms\n\n$formattedBody';
      });
    } catch (e) {
      setState(() {
        _responses[key] = 'Exception: $e';
      });
    } finally {
      setState(() {
        _loading[key] = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final Map<String, List<ApiEndpointDef>> grouped = {};
    for (var ep in endpoints) {
      grouped.putIfAbsent(ep.category, () => []).add(ep);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context).devToolsEndpointTesterTitle),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        itemCount: grouped.keys.length,
        itemBuilder: (context, index) {
          final category = grouped.keys.elementAt(index);
          final eps = grouped[category]!;

          return ExpansionTile(
            title: Text(category, style: const TextStyle(fontWeight: FontWeight.bold)),
            children: eps.map((ep) => _buildEndpointCard(context, ep)).toList(),
          );
        },
      ),
    );
  }

  Widget _buildEndpointCard(BuildContext context, ApiEndpointDef endpoint) {
    final l10n = AppLocalizations.of(context);
    final key = endpoint.name;
    final isLoading = _loading[key] ?? false;
    final response = _responses[key];

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getMethodColor(endpoint.method),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    endpoint.method,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    endpoint.path,
                    style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w600),
                  ),
                ),
                if (endpoint.requiresAuth)
                  const Icon(Icons.lock, size: 16, color: Colors.grey),
              ],
            ),
            const SizedBox(height: 8),
            Text(endpoint.name, style: const TextStyle(color: Colors.grey)),
            if (endpoint.defaultBody != null) ...[
              const SizedBox(height: 12),
              Text(l10n.devToolsBodyLabel, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(8),
                color: Colors.grey.shade100,
                child: Text(endpoint.defaultBody!, style: const TextStyle(fontFamily: 'monospace', fontSize: 12)),
              ),
            ],
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoading ? null : () => _executeRequest(endpoint),
                child: isLoading
                    ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(l10n.devToolsSendRequestButton),
              ),
            ),
            if (response != null) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  response,
                  style: const TextStyle(color: Colors.greenAccent, fontFamily: 'monospace', fontSize: 12),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _getMethodColor(String method) {
    switch (method.toUpperCase()) {
      case 'GET': return Colors.blue;
      case 'POST': return Colors.green;
      case 'PATCH': return Colors.orange;
      case 'DELETE': return Colors.red;
      default: return Colors.grey;
    }
  }
}
