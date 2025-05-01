// interface AdditionalInfoValue {
//   [key: string]: unknown;
// }

export interface AnalysisResult {
  analysis_id: string;
  repo_url: string;
  branch: string;
  git_hash: string;
  dependencies: string[];
  framework: string;
  analysis: string; // LLM summary
  summary: string;
  recommended_base_image?: string;
  base_image: string;
  ports: number[];
  build_steps: string[];
  run_command: string;
  environment_variables: string[];
  volumes: string[];
  additional_info?: Record<string, AdditionalInfoValue>;
}


type AdditionalInfoValue = string | number | boolean | string[] | number[] | null;

export interface AnalysisResultsProps {
  analysis: {
    analysis_id: string;
    framework: string;
    dependencies: string[];
    summary: string;
    ports: number[];
    run_command: string;
    base_image: string;
    additional_info?: Record<string, AdditionalInfoValue>;
  };
}
