import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import React, { type PropsWithChildren } from 'react';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';

import { osSchemeQuery, resolveScheme, storedScheme } from './color-scheme';
import { darkTheme, lightTheme } from './theme';

/**
 * The default DocsContainer only ever sees the static `parameters.docs.theme`, so the body of
 * a docs page (title, description, controls table) stayed light even once the story canvas and
 * the manager chrome had switched to dark. Passing the matching theme down keeps it in sync.
 *
 * The scheme cannot be read with `useGlobals()` here: that is a preview hook and only works
 * inside a decorator or a story function, not in a React component. The docs context exposes
 * both halves instead - the current value through the story context, later changes through the
 * channel the manager updates globals over.
 */
type DocsContext = DocsContainerProps['context'];

/** `undefined` while no mode is forced, which `resolveScheme` reads as "ask the OS". */
const schemeGlobalOf = (context: DocsContext): string | undefined => {
  try {
    return context.getStoryContext(context.storyById()).globals?.backgrounds?.value;
  } catch {
    // A docs page without an attached CSF file - the Iconset page - has no story to read
    // globals from, so fall back to what the toolbar persisted the last time it changed.
    return storedScheme();
  }
};

export const ColorSchemeDocsContainer = ({
  context,
  ...props
}: PropsWithChildren<DocsContainerProps>) => {
  const [scheme, setScheme] = React.useState(() => resolveScheme(schemeGlobalOf(context)));

  React.useEffect(() => {
    const onGlobalsUpdated = ({ globals }: { globals: Record<string, any> }) =>
      setScheme(resolveScheme(globals?.backgrounds?.value));
    context.channel.on(GLOBALS_UPDATED, onGlobalsUpdated);

    // Only has an effect while no mode is forced - resolveScheme ignores the OS otherwise.
    const os = osSchemeQuery();
    const onOsChange = () => setScheme(resolveScheme(schemeGlobalOf(context)));
    os?.addEventListener('change', onOsChange);

    return () => {
      context.channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
      os?.removeEventListener('change', onOsChange);
    };
  }, [context]);

  return (
    <DocsContainer
      {...props}
      context={context}
      theme={scheme === 'dark' ? darkTheme : lightTheme}
    />
  );
};
