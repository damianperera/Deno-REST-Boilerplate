import { Routes } from 'app/models/routes.ts'
import { ProductsService } from 'app/service/implementation/products.ts'

const GET: Routes.Methods = Routes.Methods.GET

const products: Routes.Endpoints[] = [
    {
        httpMethod: GET,
        path: '',
        serviceMethod: new ProductsService().getName
    },
    {
        httpMethod: GET,
        path: '/:productId/regions/:regionCode',
        serviceMethod: new ProductsService().getProductByRegion
    }
]

export default products