import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config_provider.dart';
import 'api_response_cache.dart';
import 'backend_api_client.dart';
import 'media_cache.dart';
import 'network_status.dart';

final backendApiClientProvider = Provider<BackendApiClient>((ref) {
  return BackendApiClient(
    config: ref.watch(appConfigProvider),
    responseCache: ApiResponseCache.instance,
    mediaCache: MediaCache.instance,
    networkStatus: NetworkStatus.instance,
  );
});
