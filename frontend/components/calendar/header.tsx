import Link from 'next/link'
import React from 'react'
import { BadgeWithLabel } from './badge'
import Styles from './header.module.css'
import { BADGES, CalendarDto } from './utils'

type Props = {
  calendar: CalendarDto
  badgeFilter: string | null
  onBadgeFilterToggle(badge: string): void
}

export const Header = ({ calendar, badgeFilter, onBadgeFilterToggle }: Props) => {
  return (
    <div className={Styles.header}>
      <div className={Styles.container}>
        <h1 className={Styles.yearMonth}>{calendar.yearMonth}</h1>

        <div className={Styles.nav}>
          {[
            {value: 'general', label: '일반'},
            {value: 'comic', label: '만화'},
            {value: 'lightnovel', label: '라노벨'}
          ].map(({ value, label }) => (
            <Link href={`/calendar/${value}`}>
              <a className={value === calendar.category ? Styles.activeNavItem : Styles.navItem}>{label}</a>
            </Link>
          ))}
        </div>

        <div className={Styles.badgeLegend}>
          {Object.keys(BADGES).map(it => (
            <div className={`${Styles.badge} ${badgeFilter ? (it === badgeFilter ? Styles.activeBadge : Styles.inactiveBadge) : ''}`} onClick={() => onBadgeFilterToggle(it)}>
              <BadgeWithLabel badge={it} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
