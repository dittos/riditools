import { GetServerSideProps } from 'next'

export default () => null;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: '/calendar/comic',
      permanent: false
    }
  }
}
