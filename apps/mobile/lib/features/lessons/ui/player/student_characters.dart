// The four student characters that present lessons and play the speakers of a dialogue.
// Artwork lives in assets/characters/ (transparent WebP: full body + head-and-shoulders avatar).

import 'package:flutter/foundation.dart';

enum CharacterGender { male, female }

/// Which way the artwork looks. The scene mirrors it so characters face each other.
enum CharacterFacing { left, right }

@immutable
class StudentCharacter {
  const StudentCharacter({
    required this.id,
    required this.name,
    required this.gender,
    required this.faces,
  });

  final String id;
  final String name;
  final CharacterGender gender;
  final CharacterFacing faces;

  String get bodyAsset => 'assets/characters/$id.webp';
  String get avatarAsset => 'assets/characters/$id-avatar.webp';
}

abstract final class StudentCharacters {
  static const adam = StudentCharacter(
    id: 'adam',
    name: 'Adam',
    gender: CharacterGender.male,
    faces: CharacterFacing.left,
  );
  static const sarah = StudentCharacter(
    id: 'sarah',
    name: 'Sarah',
    gender: CharacterGender.female,
    faces: CharacterFacing.left,
  );
  static const tariq = StudentCharacter(
    id: 'tariq',
    name: 'Tariq',
    gender: CharacterGender.male,
    faces: CharacterFacing.right,
  );
  static const yasmin = StudentCharacter(
    id: 'yasmin',
    name: 'Yasmin',
    gender: CharacterGender.female,
    faces: CharacterFacing.right,
  );

  static const malePool = [adam, tariq];
  static const femalePool = [sarah, yasmin];

  /// Order used to pick a lesson's presenter (same as the student web app).
  static const presenterOrder = [sarah, adam, yasmin, tariq];
}
