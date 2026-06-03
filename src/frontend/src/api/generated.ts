export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/game": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["UiState"];
                        "application/json": components["schemas"]["UiState"];
                        "text/json": components["schemas"]["UiState"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/game/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["UiState"];
                        "application/json": components["schemas"]["UiState"];
                        "text/json": components["schemas"]["UiState"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/game/{id}/buildings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["PlaceBuildingRequest"];
                    "text/json": components["schemas"]["PlaceBuildingRequest"];
                    "application/*+json": components["schemas"]["PlaceBuildingRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["UiState"];
                        "application/json": components["schemas"]["UiState"];
                        "text/json": components["schemas"]["UiState"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/game/{id}/round": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["UiState"];
                        "application/json": components["schemas"]["UiState"];
                        "text/json": components["schemas"]["UiState"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @enum {unknown} */
        BuildingType: "Base" | "Housing" | "Consumer" | "Industry" | "PowerPlant";
        /** @enum {unknown} */
        GameResult: "None" | "Win" | "Loss";
        PlaceBuildingRequest: {
            /** Format: int32 */
            x: number;
            /** Format: int32 */
            y: number;
            type: components["schemas"]["BuildingType"];
        };
        UiBuildingSlot: {
            /** Format: int32 */
            x: number;
            /** Format: int32 */
            y: number;
            type: components["schemas"]["BuildingType"];
            isNewlyBuilt: boolean;
        };
        UiBuildingTypeInfo: {
            type: components["schemas"]["BuildingType"];
            /** Format: int32 */
            populationCost: number;
            /** Format: int32 */
            industryCost: number;
            /** Format: int32 */
            energyCost: number;
            /** Format: int32 */
            consumerGoodsProduction: number;
            /** Format: int32 */
            industryProduction: number;
            /** Format: int32 */
            energyProduction: number;
            /** Format: int32 */
            housingContribution: number;
            /** Format: int32 */
            maintenancePopulationCost: number;
            /** Format: int32 */
            maintenanceIndustryCost: number;
            /** Format: int32 */
            maintenanceEnergyCost: number;
            isBuildable: boolean;
            canAfford: boolean;
        };
        UiState: {
            backendVersion: string;
            /** Format: int32 */
            gameStateId: number;
            /** Format: int32 */
            round: number;
            /** Format: int32 */
            population: number;
            /** Format: int32 */
            freePopulation: number;
            /** Format: int32 */
            boundPopulation: number;
            /** Format: int32 */
            consumerGoods: number;
            /** Format: int32 */
            industry: number;
            /** Format: int32 */
            energy: number;
            /** Format: int32 */
            housing: number;
            /** Format: int32 */
            consumerGoodsGain: number;
            /** Format: int32 */
            industryGain: number;
            /** Format: int32 */
            energyGain: number;
            /** Format: int32 */
            populationGain: number;
            gameResult: components["schemas"]["GameResult"];
            buildings: components["schemas"]["UiBuildingSlot"][];
            buildingTypes: components["schemas"]["UiBuildingTypeInfo"][];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
