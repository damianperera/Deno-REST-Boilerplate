import { Router } from 'https://deno.land/x/oak/mod.ts'
import * as log from 'https://deno.land/std/log/mod.ts'
import { Constants } from 'constants'
import { Routes } from 'models/routes.ts'

const { readDirSync } = Deno

export const router = new Router()

new class BaseRoute {

    private readonly INVALID_ENDPOINT_TYPE = 'Ensure endpoints are of type Array<Routes.Endpoints> - invalid endpoint type declaration found in'

    constructor() {
        this.generateRoutes()
    }

    generateRoutes = () => {
        const entries: Iterable<any> = readDirSync(Constants.CONTROLLER_DIRECTORY)
        for (const entry of entries) {
            const entryName = entry.name.split('.').slice(0, -1).join('.');
        
            if (entry.isFile) {
                const mainRoute = `${Constants.BASE_PATH}${entryName}`
                const filePath = `../../${Constants.CONTROLLER_DIRECTORY}/${entry.name}`
        
                import(filePath).then((module) => {
                    const endpoints: Array<Routes.Endpoints> = module.default

                    for (const endpoint of endpoints) {
                        if (!Routes.isEndpoint(endpoint)) {
                            log.error(`${this.INVALID_ENDPOINT_TYPE} ${filePath.substring(3)}`)
                            Deno.exit(1)
                        }

                        const method : Routes.Methods = endpoint.httpMethod
                        const route = `${mainRoute}${endpoint.path}`
        
                        log.info(`Configured - ${method.toUpperCase()} ${route}`)
                        // @ts-ignore
                        router[method](route, endpoint.serviceMethod)
                    }
                })
            }
        }
    }
}
    