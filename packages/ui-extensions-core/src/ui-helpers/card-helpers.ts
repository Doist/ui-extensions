import { type DoistCardVersion, DoistCard } from '../doist-card'

export function createEmptyCard(doistCardVersion?: DoistCardVersion): DoistCard {
    return DoistCard.from({ doistCardVersion: doistCardVersion || '0.5' })
}
