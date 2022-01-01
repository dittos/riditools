import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { Connection, createConnection } from 'typeorm'
import { Calendar } from '../entity/calendar'
import { Static, Type } from '@sinclair/typebox'

declare module 'fastify' {
  interface FastifyInstance {
    db: Connection;
  }
}

const server: FastifyInstance = Fastify({
  logger: {
    level: 'error',
  }
})

const GetLatestCalendarRequest = Type.Object({
  category: Type.String(),
})
type GetLatestCalendarRequestType = Static<typeof GetLatestCalendarRequest>;

const CalendarEntry = Type.Object({
  title: Type.String(),
  badges: Type.Array(Type.String()),
  alert: Type.Union([Type.String(), Type.Null()]),
  authors: Type.String(),
  date: Type.String(), // yyyy-MM-dd
})
const CalendarDto = Type.Object({
  id: Type.String(),
  category: Type.String(),
  yearMonth: Type.String(),
  entries: Type.Array(CalendarEntry),
  fetchedAt: Type.String(),
})
const GetLatestCalendarResponse = Type.Object({
  calendar: CalendarDto,
})
type GetLatestCalendarResponseType = Static<typeof GetLatestCalendarResponse>;

const opts: RouteShorthandOptions = {
  schema: {
    querystring: GetLatestCalendarRequest,
    response: {
      200: GetLatestCalendarResponse
    }
  }
}

server.get<{ Querystring: GetLatestCalendarRequestType, Reply: GetLatestCalendarResponseType }>('/api/GetLatestCalendar', opts, async (request, reply) => {
  return server.db.transaction(async em => {
    const calendar = await em.findOne(Calendar, { where: { category: request.query.category }, order: { yearMonth: 'DESC' } })
    if (!calendar) {
      reply.code(404).send();
      return;
    }
    reply.send({
      calendar: {
        id: calendar.id.toString(),
        category: calendar.category,
        yearMonth: calendar.yearMonth,
        entries: calendar.entries,
        fetchedAt: calendar.fetchedAt.toJSON(),
      },
    });
  });
})

export async function handler() {
  try {
    const connection = await createConnection();
    server.decorate('db', connection);
    await server.listen(3001)

    const address = server.server.address()
    const port = typeof address === 'string' ? address : address?.port

  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
