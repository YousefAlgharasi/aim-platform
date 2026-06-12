import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config_provider.dart';
import 'backend_api_client.dart';

final backendApiClientProvider = Provider<BackendApiClient>((ref) {
  return BackendApiClient(config: ref.watch(appConfigProvider));
});
