type RegistryItem = {
  id: string;
  name: string;
  version?: string;
  [key: string]: any;
};

const agents = new Map<string, RegistryItem>();
const tools = new Map<string, RegistryItem>();
const builders = new Map<string, RegistryItem>();
const templates = new Map<string, RegistryItem>();

export const SugentSDK = {
  registerAgent(agent: RegistryItem) {
    agents.set(agent.id, agent);
    return agent;
  },

  registerTool(tool: RegistryItem) {
    tools.set(tool.id, tool);
    return tool;
  },

  registerBuilder(builder: RegistryItem) {
    builders.set(builder.id, builder);
    return builder;
  },

  registerTemplate(template: RegistryItem) {
    templates.set(template.id, template);
    return template;
  },

  list() {
    return {
      agents: Array.from(agents.values()),
      tools: Array.from(tools.values()),
      builders: Array.from(builders.values()),
      templates: Array.from(templates.values()),
    };
  },
};
