import { GetServerSideProps, NextPage } from 'next'
import Link from 'next/link'
import React from 'react'
import Styles from '../../styles/calendar.module.css';

const BADGES: {[key: string]: {char: string, color: string}} = {
  'RIDI ONLY': {
    char: 'R',
    color: '#478aea',
  },
  '세트전': {
    char: 'S',
    color: '#ff6c9a',
  },
  '후속권 업데이트': {
    char: '▶',
    color: '#5cc66d',
  },
  '신작': {
    char: 'N',
    color: '#ff7166',
  }
}

const Home: NextPage = ({ calendar }: any) => {
  const dateGroups: any[] = [];
  let group: any[] = [];
  let lastKey = '';
  for (let entry of calendar.entries) {
    if (entry.date !== lastKey) {
      if (group.length > 0 && lastKey) dateGroups.push({ date: entry.date, entries: group })
      lastKey = entry.date
      group = []
    }
    group.push(entry)
  }

  return (
    <div className={Styles.container}>
      <div className={Styles.header}>
        <h1 className={Styles.yearMonth}>{calendar.yearMonth}</h1>

        <div className={Styles.nav}>
          {[
            {value: 'general', label: '일반'},
            {value: 'comic', label: '만화'},
            {value: 'lightnovel', label: '라노벨'}
          ].map(({ value, label }) => (
            <Link href={`/calendar/${value}`}>
              <a>{label}</a>
            </Link>
          ))}
        </div>

        <div className={Styles.badgeLegend}>
          {Object.keys(BADGES).map(it => (
            <div className={Styles.badgeWithLabel}>
              <span className={Styles.badge} style={{ backgroundColor: BADGES[it]?.color }}>{BADGES[it]?.char ?? it[0]}</span>
              <span>{it}</span>
            </div>
          ))}
        </div>
      </div>

      {dateGroups.map(group => (<>
        <section className={Styles.dateContainer}>
          <h3 className={Styles.dateTitle}>
            {new Intl.DateTimeFormat('ko-KR', { day: 'numeric', weekday: 'short' }).format(new Date(group.date))}
          </h3>
          <table className={Styles.dateTable}>
            <tbody>
              {group.entries.map((entry: any, i: number) => (
                <tr key={"row-" + i}>
                  <td className={Styles.titleCell}>
                    {entry.title}
                  </td>
                  <td className={Styles.authorCell}>
                    {entry.authors}
                  </td>
                  <td className={Styles.badgeCell}>
                    <div className={Styles.badgeContainer}>
                      {entry.badges.map((it: string) => <span className={Styles.badge} style={{ backgroundColor: BADGES[it]?.color }}>{BADGES[it]?.char ?? it[0]}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </>))}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch(`http://localhost:3001/api/GetLatestCalendar?category=${context.params!.category}`)
  const { calendar } = await res.json()
  return {
    props: {
      calendar,
    },
  }
}

export default Home
