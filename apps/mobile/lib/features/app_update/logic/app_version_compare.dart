/// Compares two "major.minor.patch" versions, ignoring any "+build" or
/// "-pre" suffix. Missing or non-numeric parts count as 0.
///
/// Returns a negative number if [a] is older than [b], zero if equal, and a
/// positive number if [a] is newer.
int compareAppVersions(String a, String b) {
  final left = _parts(a);
  final right = _parts(b);
  for (var i = 0; i < 3; i++) {
    final diff = left[i].compareTo(right[i]);
    if (diff != 0) return diff;
  }
  return 0;
}

List<int> _parts(String version) {
  final core = version.split(RegExp(r'[+-]')).first.trim();
  final segments = core.split('.');
  return List<int>.generate(
    3,
    (i) => i < segments.length ? int.tryParse(segments[i]) ?? 0 : 0,
  );
}
