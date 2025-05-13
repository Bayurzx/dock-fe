// interface AdditionalInfoValue {
//   [key: string]: unknown;
// }

export interface AnalysisResult {
  id?: string | null;
  analysis_id?: string | null;
  repo_url: string;
  branch: string;
  git_hash: string;
  framework: string;
  base_image: string;
  recommended_base_image?: string;
  summary: string;
  run_command: string;
  ports: number[];
  build_steps: string[];
  environment_variables: string[];
  volumes: string[];
  dependencies: string[] | DependencyMap;
  analysis?: AnalysisMetadata;
  additional_info?: Record<string, AdditionalInfoValue>;
  analyzed_at?: string;
}

export interface DependencyMap {
  [manager: string]: string[];
}

export interface AnalysisMetadata {
  project_type?: string;
  recommended_base_image?: string;
  required_packages?: string[];
  dependency_install_command?: string;
  build_steps?: string[];
  exposed_ports?: number[];
  environment_variables?: string[];
  volumes?: string[];
  run_command?: string;
  working_directory?: string;
  detected_database?: string | null;
  other_services?: string[];
  summary?: string;
}

export type AdditionalInfoValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | { [key: string]: string | number | boolean | string[] | number[] | boolean[] };

  export interface AnalysisResultsProps {
    analysis: {
      id?: string | null;
      analysis_id?: string | null;
      repo_url: string;
      branch: string;
      git_hash: string;
      dependencies: string[] | Record<string, string[]>;
      framework: string;
      summary: string;
      recommended_base_image?: string;
      base_image: string;
      ports: number[];
      build_steps: string[];
      run_command: string;
      environment_variables: string[];
      volumes: string[];
      additional_info?: Record<string, unknown>;
      analysis?: {
        project_type?: string;
        recommended_base_image?: string;
        required_packages?: string[];
        dependency_install_command?: string;
        build_steps?: string[];
        exposed_ports?: number[];
        environment_variables?: string[];
        volumes?: string[];
        run_command?: string;
        working_directory?: string;
        detected_database?: string | null;
        other_services?: string[];
        summary?: string;
      };
    };
  }
  
// User types
export interface User {
  id: string
  email: string
  full_name: string
  picture_url?: string
}

// Validation error types
export interface ValidationError {
  field: string
  message: string
}

// Error response types
export interface ErrorResponse {
  detail: string
  errors?: ValidationError[]
}

// Add the BackendError interface after the ErrorResponse interface
export interface BackendError extends Error {
  detail?: string
}

// Configuration types
export interface Configuration {
  id: string
  name: string
  type: "dockerfile" | "compose"
  created_at: string
  is_verified_good?: boolean
  content: string
  docker_compose_content?: string
  dockerfile_content?: string
}
// Service types for compose generator
export interface Service {
  name: string
  analysisId: string
  port?: string
}
