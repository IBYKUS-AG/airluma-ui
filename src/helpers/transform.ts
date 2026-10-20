const toKebabCase = (str: string): string => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

export const camelToKebab = (args: {
  [key: string]: any;
} | undefined) => {
  if (!args) return args;

  const result: { [key: string]: any } = {};

  Object.keys(args).forEach(key => {
    const kebabKey = toKebabCase(key);
    result[kebabKey] = args[key];
  });

  return result;
};