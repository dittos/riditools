import Link from 'next/link'
import React from 'react'
import { BadgeWithLabel } from './badge'
import Styles from './header.module.css'
import { BADGES } from './utils'

export const Header = ({ calendar }: { calendar: any }) => {
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
            <div className={Styles.badge}>
              <BadgeWithLabel text={it} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
