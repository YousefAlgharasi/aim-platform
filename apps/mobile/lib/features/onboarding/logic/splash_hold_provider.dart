import 'package:flutter_riverpod/flutter_riverpod.dart';

/// While `true`, the router keeps the user on the splash route even if
/// session restore has already finished, so the branded launch animation can
/// be seen. [SplashPage] releases it (sets `false`) after
/// [kSplashMinVisible], counted from the moment the splash becomes visible —
/// it never delays anything beyond that and never waits on the network.
final splashHoldProvider = StateProvider<bool>((ref) => true);

/// Minimum time the launch animation stays on screen.
const Duration kSplashMinVisible = Duration(seconds: 3);
