import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { Connection, createConnection } from 'typeorm'
import { Calendar } from '../entity/calendar'

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

const opts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          pong: {
            type: 'string'
          }
        }
      }
    }
  }
}

server.get('/ping', opts, async (request, reply) => {
  return server.db.transaction(async em => {
    console.log( await em.find(Calendar) )
    return { pong: 'it worked!' }
  });
})

export async function handler() {
  try {
    const connection = await createConnection();
    server.decorate('db', connection);
    await server.listen(3000)

    const address = server.server.address()
    const port = typeof address === 'string' ? address : address?.port

  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
