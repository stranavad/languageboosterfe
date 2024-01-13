export interface Project {
    id: number;
    name: string;
}

export interface Language {
    id: number;
    name: string;
    projectId: number;
}

export interface Mutation {
    id: number;
    key: string;
    status: string;
    values: MutationValue[]
}

export interface MutationValue {
    id: number;
    value: string;
    status: string;
    languageId: number;
}
