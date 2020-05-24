import { Router } from 'remote/x/oak/mod.ts'
import * as log from 'remote/std/log/mod.ts'
import { Constants } from 'app/constants'
import { Routes } from 'app/models/routes.ts'

const { readDirSync } = Deno

export const router = new Router()

new class BaseRoute {

    private readonly INVALID_ENDPOINT_TYPE = 'Ensure endpoints are of type Array<Routes.Endpoints> - invalid endpoint type declaration found in'

    constructor() {
        this.generateRoutes()
    }

    generateRoutes = () => {
        for (const entry of readDirSync(Constants.CONTROLLER_DIRECTORY)) {
            const entryName = entry.name.split('.').slice(0, -1).join('.');
        
            if (entry.isFile) {
                const mainRoute = `${Constants.BASE_PATH}${entryName}`
                const filePath = `.${Constants.CONTROLLER_DIRECTORY}/${entry.name}`
        
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
                        router[method](route, endpoint.serviceMethod)
                    }
                })
            }
        }
    }
}
    