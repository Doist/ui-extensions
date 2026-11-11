# Current core and retired React consumers

The supported current-forward release is `@todoist/ui-extensions-core@6.0.1`.
It preserves the v6 card construction, serialization and Todoist/Twist data-exchange
API. It does not render React components, implement renderer connection hooks or
ship a stylesheet. Its only exported package entry is `.`; output is CommonJS,
ES modules and declarations under `dist/`.

[Retirement PR #334](https://github.com/Doist/ui-extensions/pull/334), merged as
`21eb3de2512cf05f2c57a1a2b6c9be1c87ced732`, removed the React source, manifest,
workspace and publishing workflows. Existing historical versions remain intact.
The orphan tests under `packages/ui-extensions-react/src/types/` do not provide a
buildable producer. Rebuilding an old branch or republishing the retired package
under a new scope is not part of this migration.

## Exact consumer blockers

Current source inspection at the following commits confirms incompatible edges:

| Consumer                                                                                       | Declared dependencies                    | Missing renderer API                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend-toolbox` `ba614970a60636e7a67e3280aa5805b8311e1dc3`, `packages/extensions-renderers` | core peer `^4.1.1`, React peer `^11.0.0` | `CanHaveAutoFocus`, `TextInputist`, `ToggleInputist`, `ClipboardAction`, `SubmitActionist` in `src/renderers/input-renderers.tsx` and `actions.tsx`                                                                                                                              |
| `twist-web` `30d98585dddc9e8fe337186acbd5fd75f4454cb6`                                         | core `3.2.1`, React `6.0.0`              | `AdaptiveCardRenderer`, `useAdaptiveCardsConnection`, `BridgeActionCallbacks`, `ExtensionError`, `ExtensionVersion`, `ExtensionContext`, `ChoiceSetInputist`, `CanHaveAutoFocus`, `AdaptiveCardistCard`, `DoistCardResult`, `DoistCardConnectionParams`, plus `styles/index.css` |

These symbols are absent from current core. Core's `SubmitAction`/`TextInput`
construct serialized card data; they are not substitutes for renderer subclasses
such as `SubmitActionist`/`TextInputist`. Do not replace the React package with a core
alias or claim a scope-only dependency update is compatible. Preserve each legacy
dependency until the consumer owners approve and implement a supported renderer
path in current source, or remove the feature through a separately approved product
change. Henning routes this to the existing UI Extensions/toolbox/Twist owners;
the specific D06 owner assignment is not available in this repository.

## Core API migration is also required for pre-v6 clients

The breaking v6 API change predates this scope migration; see
[PR #342](https://github.com/Doist/ui-extensions/pull/342). Examples:

| Legacy API                                                                                         | Current core API                                                                                                          |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `DoistCard`, `DoistCardVersion`                                                                    | `TodoistCard`, `TodoistCardVersion`                                                                                       |
| `DoistCardAction*`, `DoistCardContext*`, `DoistCardExtensionType`                                  | corresponding `TodoistCard*` types (check Twist-specific types below)                                                     |
| `DoistCardRequest`, `DoistCardResponse`, `DoistCardError`, `DoistCardBridge*`                      | corresponding `TodoistCard*` types                                                                                        |
| `DoistContextUser`                                                                                 | `BaseContextUser`                                                                                                         |
| `card.doistCardVersion`                                                                            | `card.todoistCardVersion`                                                                                                 |
| Twist's legacy `DoistCardContextChannel`, `DoistCardContextConversation`, `DoistCardContextThread` | inspect `TwistContextChannel`, `TwistContextConversation`, `TwistContextThread` and actual shapes in `src/types/twist.ts` |

`ContextMenuData` still exists. Requests now require both
`maximumTodoistCardVersion` and the preserved `maximumDoistCardVersion` compatibility
field. Serialized cards preserve the existing legacy version keys. Consumers with
subclasses compiled against older core class names must recompile against v6;
serializer base-class identity means a dependency-only bump is insufficient.
These are migration starting points, not a verified compatibility assertion for
core 3/4 plus retired renderer 6/11. Consumer owners must verify type checks,
renderer/connection behavior, schema serialization and CSS in their actual current
applications after a forward renderer decision and real package publication.
