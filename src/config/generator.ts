import { log } from 'deps'
import Constants from 'constants'
import { Routes } from 'models/routes.ts'

new class Generator {
    private static readonly INVALID_ENDPOINT_TYPE_ERROR = 'Ensure endpoints are of type Array<Routes.Endpoints> - invalid endpoint type declaration found in'
    private routeFile = `// Generated by src/config/generator.ts - (c) 2020 Damian Perera - MIT License.\n\nimport { Router } from 'deps'\nexport const router = new Router()\n`

    private readDirSync = Deno.readDirSync
    private imports = JSON.parse(Deno.readTextFileSync('src/config/absolutePaths.json')).imports
    private entries: Iterable<any> = this.readDirSync(this.imports['controllers/'].replace('../../', './'))

    constructor() {
        this.generate()
    }

    private async generate() {
        for (const entry of this.entries) {
            const entryName = entry.name.split('.').slice(0, -1).join('.');
    
            if (entry.isFile) {
                const mainRoute = `${Constants.BASE_PATH}${entryName}`
                const filePath = `${this.imports['controllers/']}${entry.name}`
    
                this.routeFile = this.routeFile + `\nimport ${entryName} from 'controllers/${entry.name}'\n`
    
                await import(filePath).then((module) => {
                    const endpoints: Array<Routes.Endpoints> = module.default
    
                    let endpointArrCount: number = 0
                    for (const endpoint of endpoints) {
                        if (!Routes.isEndpoint(endpoint)) {
                            log.error(`${Generator.INVALID_ENDPOINT_TYPE_ERROR} ${filePath.substring(3)}`)
                            Deno.exit(1)
                        }
    
                        const method: Routes.Methods = endpoint.httpMethod
                        const route = `${mainRoute}${endpoint.path}`
    
                        log.info(`Configured - ${method.toUpperCase()} ${route}`)
                        this.routeFile = this.routeFile + `router['${method}']('${route}', ${entryName}[${endpointArrCount}].serviceMethod)\n`
                        endpointArrCount++
                    }
                })
            }
        }

        this.write()
    }

    private write() {
        const encoder = new TextEncoder()
        Deno.writeFileSync('src/config/routes.ts', encoder.encode(this.routeFile))
    }
}