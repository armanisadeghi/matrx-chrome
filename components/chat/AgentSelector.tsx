import { useState, useEffect } from 'react';
import { ChevronDown, Bot, Cpu, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchActiveModels, fetchUserAgents } from '../../utils/supabase-queries';
import type { AiModel, AgentPrompt } from '../../utils/types';
import { DEFAULT_AGENTS, BUILTIN_PROMPT_IDS } from '../../utils/types';

interface AgentSelectorProps {
  selectedAgent: AgentPrompt | null;
  selectedModel: AiModel | null;
  onAgentChange: (agent: AgentPrompt | null) => void;
  onModelChange: (model: AiModel | null) => void;
}

export function AgentSelector({
  selectedAgent,
  selectedModel,
  onAgentChange,
  onModelChange,
}: AgentSelectorProps) {
  const { user } = useAuth();
  const [models, setModels] = useState<AiModel[]>([]);
  const [userAgents, setUserAgents] = useState<AgentPrompt[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'agents' | 'models'>('agents');

  useEffect(() => {
    fetchActiveModels().then(setModels);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserAgents(user.id).then(setUserAgents);
    }
  }, [user?.id]);

  const allAgents = [...DEFAULT_AGENTS, ...userAgents];
  const primaryModels = models.filter((m) => m.is_primary && !m.is_premium);
  const otherModels = models.filter((m) => !m.is_primary && !m.is_premium);
  const premiumModels = models.filter((m) => m.is_premium);

  const displayName = selectedAgent
    ? selectedAgent.name
    : selectedModel
      ? selectedModel.common_name
      : 'General Chat';

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--m-radius-md)] bg-[var(--m-bg-inset)] border border-[var(--m-border)] hover:bg-[var(--m-bg-hover)] transition-colors cursor-pointer text-left max-w-[200px]"
      >
        {selectedAgent ? (
          <Bot className="w-3 h-3 text-[var(--m-brand)] shrink-0" />
        ) : (
          <Cpu className="w-3 h-3 text-[color:var(--m-text-tertiary)] shrink-0" />
        )}
        <span className="text-xs font-medium text-[color:var(--m-text-primary)] truncate">
          {displayName}
        </span>
        <ChevronDown className="w-3 h-3 text-[color:var(--m-text-tertiary)] shrink-0" />
      </button>

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-[280px] bg-[var(--m-bg-card)] border border-[var(--m-border)] rounded-[var(--m-radius-lg)] shadow-lg z-50 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[var(--m-border)]">
              <button
                onClick={() => setPickerTab('agents')}
                className={`flex-1 px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                  pickerTab === 'agents'
                    ? 'text-[var(--m-brand)] border-b-2 border-[var(--m-brand)]'
                    : 'text-[color:var(--m-text-secondary)] hover:text-[color:var(--m-text-primary)]'
                }`}
              >
                <Bot className="w-3 h-3 inline mr-1" />
                Agents
              </button>
              <button
                onClick={() => setPickerTab('models')}
                className={`flex-1 px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                  pickerTab === 'models'
                    ? 'text-[var(--m-brand)] border-b-2 border-[var(--m-brand)]'
                    : 'text-[color:var(--m-text-secondary)] hover:text-[color:var(--m-text-primary)]'
                }`}
              >
                <Cpu className="w-3 h-3 inline mr-1" />
                Models
              </button>
            </div>

            <div className="max-h-[300px] overflow-auto">
              {pickerTab === 'agents' && (
                <div className="p-1.5">
                  {/* Built-in */}
                  <div className="px-2 py-1">
                    <span className="text-[10px] font-semibold text-[color:var(--m-text-tertiary)] uppercase tracking-wider">
                      Built-in
                    </span>
                  </div>
                  {DEFAULT_AGENTS.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        onAgentChange(agent);
                        onModelChange(null);
                        setShowPicker(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[var(--m-radius-sm)] cursor-pointer transition-colors text-left ${
                        selectedAgent?.id === agent.id
                          ? 'bg-[var(--m-brand-subtle)]'
                          : 'hover:bg-[var(--m-bg-hover)]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[var(--m-brand)] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[color:var(--m-text-primary)] truncate">
                          {agent.name}
                        </p>
                        {agent.description && (
                          <p className="text-[10px] text-[color:var(--m-text-tertiary)] truncate">
                            {agent.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* User agents */}
                  {userAgents.length > 0 && (
                    <>
                      <div className="px-2 py-1 mt-1.5">
                        <span className="text-[10px] font-semibold text-[color:var(--m-text-tertiary)] uppercase tracking-wider">
                          Your Agents
                        </span>
                      </div>
                      {userAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => {
                            onAgentChange(agent);
                            onModelChange(null);
                            setShowPicker(false);
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[var(--m-radius-sm)] cursor-pointer transition-colors text-left ${
                            selectedAgent?.id === agent.id
                              ? 'bg-[var(--m-brand-subtle)]'
                              : 'hover:bg-[var(--m-bg-hover)]'
                          }`}
                        >
                          <Bot className="w-3.5 h-3.5 text-[color:var(--m-text-secondary)] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[color:var(--m-text-primary)] truncate">
                              {agent.name}
                            </p>
                            {agent.description && (
                              <p className="text-[10px] text-[color:var(--m-text-tertiary)] truncate">
                                {agent.description}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}

              {pickerTab === 'models' && (
                <div className="p-1.5">
                  {/* Primary models */}
                  {primaryModels.length > 0 && (
                    <>
                      <div className="px-2 py-1">
                        <span className="text-[10px] font-semibold text-[color:var(--m-text-tertiary)] uppercase tracking-wider">
                          Recommended
                        </span>
                      </div>
                      {primaryModels.map((model) => (
                        <ModelRow
                          key={model.id}
                          model={model}
                          isSelected={selectedModel?.id === model.id}
                          onSelect={() => {
                            onModelChange(model);
                            onAgentChange(null);
                            setShowPicker(false);
                          }}
                        />
                      ))}
                    </>
                  )}

                  {/* Other models */}
                  {otherModels.length > 0 && (
                    <>
                      <div className="px-2 py-1 mt-1.5">
                        <span className="text-[10px] font-semibold text-[color:var(--m-text-tertiary)] uppercase tracking-wider">
                          All Models
                        </span>
                      </div>
                      {otherModels.map((model) => (
                        <ModelRow
                          key={model.id}
                          model={model}
                          isSelected={selectedModel?.id === model.id}
                          onSelect={() => {
                            onModelChange(model);
                            onAgentChange(null);
                            setShowPicker(false);
                          }}
                        />
                      ))}
                    </>
                  )}

                  {/* Premium models */}
                  {premiumModels.length > 0 && (
                    <>
                      <div className="px-2 py-1 mt-1.5">
                        <span className="text-[10px] font-semibold text-[color:var(--m-text-tertiary)] uppercase tracking-wider">
                          Premium
                        </span>
                      </div>
                      {premiumModels.map((model) => (
                        <ModelRow
                          key={model.id}
                          model={model}
                          isSelected={selectedModel?.id === model.id}
                          onSelect={() => {
                            onModelChange(model);
                            onAgentChange(null);
                            setShowPicker(false);
                          }}
                          isPremium
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ModelRow({
  model,
  isSelected,
  onSelect,
  isPremium,
}: {
  model: AiModel;
  isSelected: boolean;
  onSelect: () => void;
  isPremium?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[var(--m-radius-sm)] cursor-pointer transition-colors text-left ${
        isSelected
          ? 'bg-[var(--m-brand-subtle)]'
          : 'hover:bg-[var(--m-bg-hover)]'
      }`}
    >
      <Cpu className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[color:var(--m-text-primary)] truncate">
          {model.common_name}
        </p>
        <p className="text-[10px] text-[color:var(--m-text-tertiary)] truncate">
          {model.provider}
        </p>
      </div>
      {isPremium && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--m-warning-subtle)] text-[var(--m-warning-text)]">
          Pro
        </span>
      )}
    </button>
  );
}
