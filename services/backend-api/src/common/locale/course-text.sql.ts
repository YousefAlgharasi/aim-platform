export interface CourseTextSql {
  readonly joins: string;
  readonly title: string;
  readonly description: string;
  readonly locale: string;
}

export interface EntityTextSqlOptions {
  readonly translationTable: string;
  readonly foreignKey: string;
  readonly alias: string;
  readonly localeParam: string;
  readonly suffix: string;
}

export function entityTextSql(options: EntityTextSqlOptions): CourseTextSql {
  const { translationTable, foreignKey, alias, localeParam, suffix } = options;
  const requested = `${alias}_${suffix}_req`;
  const english = `${alias}_${suffix}_en`;
  const typedParam = `${localeParam}::text`;

  return {
    joins:
      `LEFT JOIN ${translationTable} ${requested} ON ${requested}.${foreignKey} = ${alias}.id AND ${requested}.locale = ${typedParam} ` +
      `LEFT JOIN ${translationTable} ${english} ON ${english}.${foreignKey} = ${alias}.id AND ${english}.locale = 'en'`,
    title: `COALESCE(${requested}.title, ${english}.title, ${alias}.title)`,
    description:
      `CASE WHEN ${requested}.id IS NOT NULL THEN ${requested}.description ` +
      `ELSE COALESCE(${english}.description, ${alias}.description) END`,
    locale: `CASE WHEN ${requested}.id IS NOT NULL THEN ${typedParam} ELSE 'en' END`,
  };
}

export function courseTextSql(courseAlias: string, localeParam: string): CourseTextSql {
  return entityTextSql({
    translationTable: 'course_translations',
    foreignKey: 'course_id',
    alias: courseAlias,
    localeParam,
    suffix: 'ct',
  });
}

export function lessonTextSql(lessonAlias: string, localeParam: string): CourseTextSql {
  return entityTextSql({
    translationTable: 'lesson_translations',
    foreignKey: 'lesson_id',
    alias: lessonAlias,
    localeParam,
    suffix: 'lt',
  });
}

export function chapterTextSql(chapterAlias: string, localeParam: string): CourseTextSql {
  return entityTextSql({
    translationTable: 'chapter_translations',
    foreignKey: 'chapter_id',
    alias: chapterAlias,
    localeParam,
    suffix: 'cht',
  });
}
