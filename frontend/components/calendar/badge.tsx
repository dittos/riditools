import Styles from './badge.module.css'
import { BADGES } from './utils'

export const Badge = ({ badge }: { badge: string }) => {
  return <span className={Styles.badge} style={{ backgroundColor: BADGES[badge]?.color }}>{BADGES[badge]?.char ?? badge[0]}</span>
}

export const BadgeWithLabel = ({ badge }: { badge: string }) => {
  return (
    <div className={Styles.badgeWithLabel}>
      <span className={Styles.badge}><Badge badge={badge} /></span>
      <span>{badge}</span>
    </div>
  )
}