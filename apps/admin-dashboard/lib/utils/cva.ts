import { cn } from './cn';

export type VariantConfig<V extends Record<string, Record<string, string>>> = {
  variants?: V;
  defaultVariants?: { [K in keyof V]?: keyof V[K] };
};

export function cva<V extends Record<string, Record<string, string>>>(
  base: string,
  config?: VariantConfig<V>
) {
  return (props?: { [K in keyof V]?: keyof V[K] } & { className?: string }): string => {
    if (!config || !config.variants) return cn(base, props?.className);

    const variantClasses: string[] = [];
    for (const variantName in config.variants) {
      const selectedValue =
        props?.[variantName] ?? config.defaultVariants?.[variantName];
      if (selectedValue && config.variants[variantName][selectedValue as string]) {
        variantClasses.push(config.variants[variantName][selectedValue as string]);
      }
    }

    return cn(base, ...variantClasses, props?.className);
  };
}
