import Styles from './table.module.css';
import { Badge } from './badge';
import Rating from '@mui/material/Rating';

export type DateGroup = {
  date: string
  entries: any[]
}

export const Table = ({ group }: { group: DateGroup }) => {
  return (
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
                  {entry.badges.map((it: string) => <div className={Styles.badge}><Badge text={it} /></div>)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}