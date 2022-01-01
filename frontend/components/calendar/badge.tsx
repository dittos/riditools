import Styles from './badge.module.css'
import { BADGES } from './utils'

export const Badge = ({ text }: { text: string }) => {
  return <span className={Styles.badge} style={{ backgroundColor: BADGES[text]?.color }}>{BADGES[text]?.char ?? text[0]}</span>
}

export const BadgeWithLabel = ({ text }: { text: string }) => {
  return (
    <div className={Styles.badgeWithLabel}>
      <span className={Styles.badge}><Badge text={text} /></span>
      <span>{text}</span>
    </div>
  )
}