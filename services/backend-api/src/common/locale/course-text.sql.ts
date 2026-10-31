
export interface CourseTextSql {
  readonly joins: string;
  readonly title: string;
  readonly description: string;
  readonly locale: string;
}

export function courseTextSql(courseAlias: string, localeParam: string): CourseTextSql {
  const requested = `${courseAlias}_ct_req`;
  const english = `${courseAlias}_ct_en`;
  const typedParam = `${localeParam}::text`;

  return {
    joins:
      `LEFT JOIN course_translations ${requested} ON ${requested}.course_id = ${courseAlias}.id AND ${requested}.locale = ${typedParam} ` +
      `LEFT JOIN course_translations ${english} ON ${english}.course_id = ${courseAlias}.id AND ${english}.locale = 'en'`,
    title: `COALESCE(${requested}.title, ${english}.title, ${courseAlias}.title)`,
    description:
      `CASE WHEN ${requested}.id IS NOT NULL THEN ${requested}.description ` +
      `ELSE COALESCE(${english}.description, ${courseAlias}.description) END`,
    locale: `CASE WHEN ${requested}.id IS NOT NULL THEN ${typedParam} ELSE 'en' END`,
  };
}

