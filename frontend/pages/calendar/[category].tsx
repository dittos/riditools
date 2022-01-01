import { GetServerSideProps, NextPage } from 'next'
import React from 'react'
import Styles from '../../styles/calendar.module.css';
import { Header } from '../../components/calendar/header';
import { DateGroup, Table } from '../../components/calendar/table';
import { CalendarDto } from '../../components/calendar/utils';

function groupByDate(entries: any[]): DateGroup[] {
  const dateGroups: DateGroup[] = []
  let group: any[] = []
  let lastKey = ''
  for (let entry of entries) {
    if (entry.date !== lastKey) {
      if (group.length > 0 && lastKey) dateGroups.push({ date: entry.date, entries: group })
      lastKey = entry.date
      group = []
    }
    group.push(entry)
  }
  return dateGroups
}

const Home: NextPage<{ calendar: CalendarDto }> = ({ calendar }) => {
  const dateGroups = groupByDate(calendar.entries)

  return (
    <>
      <Header calendar={calendar} />

      <div className={Styles.container}>
        {dateGroups.map(group => (
          <Table group={group} />
        ))}
      </div>
    </>
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
