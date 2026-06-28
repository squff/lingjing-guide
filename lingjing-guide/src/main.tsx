import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  Camera,
  Clock3,
  Compass,
  Database,
  Gauge,
  HeartPulse,
  Home,
  Map,
  MapPin,
  Mic,
  MonitorPlay,
  Navigation,
  PhoneCall,
  Play,
  Radio,
  RefreshCcw,
  Route,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TicketCheck,
  Upload,
  UserRound,
  Volume2,
  Waves,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Answer,
  VisitorProfile,
  aiInsightCards,
  answerQuestion,
  costData,
  defaultProfile,
  demoScript,
  emergencyPlans,
  emotionTrend,
  facilities,
  faq,
  hotQuestions,
  knowledgeQuality,
  operationSuggestions,
  photoRecommendations,
  proactiveAlerts,
  realScenePois,
  realSceneSteps,
  recommendRoute,
  routeConversion,
  scoreMatrix,
  satisfactionTrend,
  spots,
  timelineTasks,
  unresolvedQuestions,
} from "./data";
import { VoiceConfig, defaultVoiceConfig, speakWithVoiceEngine } from "./voice";
import "./styles.css";

type AppMode = "portal" | "visitor" | "admin";
type AdminTab = "overview" | "knowledge" | "finale";
type VisitorTab = "route" | "map" | "chat" | "photo" | "safety" | "settings";

type Message = {
  role: "visitor" | "guide";
  text: string;
  answer?: Answer;
};

const chartColors = ["#d8b766", "#74c7b0", "#ef8f72", "#8aa8ff", "#c7d66b"];

const guideModels = [
  {
    id: "mori-miko",
    label: "狐娘巫女",
    tone: "温柔讲解",
    source: "Fox Hime Zero / mori_miko",
    path: "/live2d/foxgirl/mori_miko_guide.model3.json",
    scale: 0.9,
    y: 0.08,
  },
  {
    id: "mori-suit",
    label: "狐娘制服",
    tone: "活泼陪伴",
    source: "Fox Hime Zero / mori_suit",
    path: "/live2d/mori_suit/mori_suit_guide.model3.json",
    scale: 0.9,
    y: 0.08,
  },
  {
    id: "ruri-miko",
    label: "琉璃巫女",
    tone: "安静治愈",
    source: "Fox Hime Zero / ruri_miko",
    path: "/live2d/ruri_miko/ruri_miko_guide.model3.json",
    scale: 0.9,
    y: 0.08,
  },
  {
    id: "mori-cape",
    label: "狐娘披风",
    tone: "元气路线",
    source: "Fox Hime Zero / mori_mikoc",
    path: "/live2d/mori_mikoc/mori_mikoc_guide.model3.json",
    scale: 0.9,
    y: 0.08,
  },
  {
    id: "senko",
    label: "仙狐导游",
    tone: "长辈友好",
    source: "Live2D / Senko_Normals",
    path: "/live2d/senko/senko.model3.json",
    scale: 0.78,
    y: 0.08,
  },
] as const;

type GuideModel = (typeof guideModels)[number];

const guideMapPositions: Record<string, { x: number; y: number }> = {
  灵山大照壁: { x: 46, y: 84 },
  五明桥: { x: 27, y: 68 },
  佛足坛: { x: 32, y: 62 },
  五智门: { x: 37, y: 55 },
  菩提大道: { x: 36, y: 50 },
  九龙灌浴: { x: 36, y: 46 },
  祥符禅寺: { x: 35, y: 31 },
  灵山大佛: { x: 24, y: 18 },
  佛手广场: { x: 22, y: 43 },
  百子戏弥勒: { x: 42, y: 35 },
  灵山梵宫: { x: 79, y: 42 },
  五印坛城: { x: 66, y: 59 },
  无尽意斋: { x: 6, y: 29 },
  降魔浮雕: { x: 31, y: 34 },
  阿育王柱: { x: 12, y: 53 },
  佛教文化博览馆: { x: 51, y: 42 },
  入口服务区: { x: 52, y: 87 },
  古银杏长椅: { x: 71, y: 60 },
  中轴服务台: { x: 39, y: 57 },
  梵宫轻食: { x: 82, y: 47 },
  东侧出口: { x: 74, y: 70 },
  实时定位: { x: 47, y: 85 },
  最佳机位: { x: 37, y: 47 },
  低台阶通道: { x: 33, y: 35 },
  最近卫生间: { x: 39, y: 57 },
  雨天入口: { x: 79, y: 43 },
};

const spotPhotoMap: Record<string, { image: string; label: string }> = {
  灵山大照壁: { image: "/spots/shengjing-gate.jpg", label: "灵山胜境入口实景" },
  五明桥: { image: "/spots/wuming-bridge-sina.jpg", label: "五明桥区域实景" },
  佛足坛: { image: "/spots/buddha-foot-close.jpg", label: "佛足坛实景" },
  五智门: { image: "/spots/wuzhi-gate-sina.jpg", label: "五智门实景" },
  菩提大道: { image: "/spots/bodhi-avenue.jpg", label: "菩提大道实景" },
  九龙灌浴: { image: "/spots/jiulong-sina.jpg", label: "九龙灌浴实景" },
  祥符禅寺: { image: "/spots/shengjing-gate.jpg", label: "祥符禅寺周边实景" },
  灵山大佛: { image: "/spots/lingshan-buddha.jpg", label: "灵山大佛实景" },
  佛手广场: { image: "/spots/buddha-hand.jpg", label: "佛手广场实景" },
  百子戏弥勒: { image: "/spots/jiulong-bath.jpg", label: "百子戏弥勒周边实景" },
  灵山梵宫: { image: "/spots/brahma-palace-wide.jpg", label: "灵山梵宫实景" },
  五印坛城: { image: "/spots/brahma-palace.jpg", label: "五印坛城建筑实景" },
  无尽意斋: { image: "/spots/bodhi-avenue.jpg", label: "无尽意斋周边实景" },
  降魔浮雕: { image: "/spots/buddha-foot-close.jpg", label: "佛教文化景观实景" },
  阿育王柱: { image: "/spots/wuming-bridge-sina.jpg", label: "阿育王柱周边实景" },
  佛教文化博览馆: { image: "/spots/brahma-palace-wide.jpg", label: "佛教文化建筑实景" },
  入口服务区: { image: "/spots/shengjing-gate.jpg", label: "入口服务区实景" },
  古银杏长椅: { image: "/spots/bodhi-avenue.jpg", label: "林荫休息区实景" },
  中轴服务台: { image: "/spots/bodhi-avenue.jpg", label: "中轴服务区实景" },
  梵宫轻食: { image: "/spots/brahma-palace-wide.jpg", label: "梵宫轻食周边实景" },
  东侧出口: { image: "/spots/shengjing-gate.jpg", label: "景区出口周边实景" },
  实时定位: { image: "/spots/wuming-bridge-sina.jpg", label: "当前位置实景" },
  最佳机位: { image: "/spots/jiulong-sina.jpg", label: "最佳机位实景" },
  低台阶通道: { image: "/spots/bodhi-avenue.jpg", label: "舒缓通道实景" },
  最近卫生间: { image: "/spots/bodhi-avenue.jpg", label: "服务点周边实景" },
  雨天入口: { image: "/spots/brahma-palace-wide.jpg", label: "雨天入口实景" },
};

const fallbackSpotPhotos = [
  { image: "/spots/shengjing-gate.jpg", label: "灵山胜境入口实景" },
  { image: "/spots/wuzhi-gate-sina.jpg", label: "灵山胜境门楼实景" },
  { image: "/spots/bodhi-avenue.jpg", label: "灵山胜境步道实景" },
  { image: "/spots/jiulong-sina.jpg", label: "灵山胜境广场实景" },
  { image: "/spots/buddha-hand.jpg", label: "灵山胜境祈福点实景" },
  { image: "/spots/brahma-palace-wide.jpg", label: "灵山胜境建筑实景" },
];

function getGuideMapPosition(name: string, fallback: { x: number; y: number }) {
  return guideMapPositions[name] ?? fallback;
}

function getSpotPhoto(name: string) {
  const mappedPhoto = spotPhotoMap[name];
  if (mappedPhoto) return mappedPhoto;

  const photoIndex =
    Array.from(name).reduce((total, character) => total + character.charCodeAt(0), 0) % fallbackSpotPhotos.length;
  return fallbackSpotPhotos[photoIndex];
}

function briefText(text: string, length = 92) {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function interpolateMapPosition(from: { x: number; y: number }, to: { x: number; y: number }, progress: number) {
  const ratio = Math.min(Math.max(progress, 0), 100) / 100;
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

function getModeFromHash(): AppMode {
  const hash = window.location.hash.replace("#/", "").replace("#", "");
  if (hash === "visitor") return "visitor";
  if (hash === "admin") return "admin";
  return "portal";
}

function App() {
  const [mode, setMode] = useState<AppMode>(() => getModeFromHash());
  const [adminTab, setAdminTab] = useState<AdminTab>("overview");
  const [profile, setProfile] = useState<VisitorProfile>(defaultProfile);
  const [question, setQuestion] = useState("老人同行半日游，帮我安排少台阶路线");
  const [speaking, setSpeaking] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening">("idle");
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(defaultVoiceConfig);
  const [voiceMessage, setVoiceMessage] = useState("开源本地 TTS 优先，失败后自动使用浏览器语音。");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "guide",
      text: "你好，我是灵境导游。你可以告诉我同行人、时间、体力和兴趣，我会生成路线、地图、讲解、拍照机位和应急方案。",
    },
  ]);

  const route = useMemo(() => recommendRoute(profile), [profile]);
  const latestAnswer = [...messages].reverse().find((message) => message.answer)?.answer;

  useEffect(() => {
    const syncMode = () => setMode(getModeFromHash());
    window.addEventListener("hashchange", syncMode);
    return () => window.removeEventListener("hashchange", syncMode);
  }, []);

  function updateProfile(next: Partial<VisitorProfile>) {
    setProfile((current) => ({ ...current, ...next }));
  }

  function ask(nextQuestion = question) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) return;
    const answer = answerQuestion(trimmed, profile);
    setMessages((current) => [
      ...current,
      { role: "visitor", text: trimmed },
      { role: "guide", text: answer.text, answer },
    ]);
    setQuestion("");
    speak(answer.text);
  }

  async function speak(text: string) {
    setSpeaking(true);
    const result = await speakWithVoiceEngine(text, voiceConfig);
    setVoiceMessage(result.message);
    const estimatedDuration = Math.min(7600, Math.max(2400, text.length * 80));
    window.setTimeout(() => setSpeaking(false), estimatedDuration);
  }

  function startVoiceDemo() {
    setVoiceState("listening");
    window.setTimeout(() => {
      setVoiceState("idle");
      const demo = profile.group === "老人同行" ? "我有点累，老人同行，帮我改成少台阶路线" : "九龙灌浴什么时候表演，哪里拍照好看？";
      setQuestion(demo);
      ask(demo);
    }, 900);
  }

  if (mode === "visitor") {
    return (
      <VisitorShell>
        <VisitorConsole
          profile={profile}
          updateProfile={updateProfile}
          route={route}
          messages={messages}
          question={question}
          setQuestion={setQuestion}
          ask={ask}
          speaking={speaking}
          voiceState={voiceState}
          startVoiceDemo={startVoiceDemo}
          latestAnswer={latestAnswer}
          voiceConfig={voiceConfig}
          setVoiceConfig={setVoiceConfig}
          voiceMessage={voiceMessage}
        />
      </VisitorShell>
    );
  }

  if (mode === "admin") return <AdminShell active={adminTab} setActive={setAdminTab} />;

  return <PortalShell />;
}

function PortalShell() {
  return (
    <main className="portal-shell">
      <section className="portal-hero">
        <p className="eyebrow">中国软件杯 A5 / 景区导览服务 AI 数字人</p>
        <h1>灵境导游</h1>
        <p>游客端提供数字人、语音问答、地图路线、拍照打卡和应急无障碍；管理端提供知识库、情绪洞察、客流热力和运营闭环。</p>
      </section>
      <section className="portal-actions">
        <a className="portal-card visitor-entry" href="#/visitor">
          <Bot size={34} />
          <span>游客端</span>
          <strong>随身 AI 导游</strong>
          <p>Live2D 形象、个性化路线、地图导航、拍照机位、语音讲解、儿童/老人/研学讲法。</p>
        </a>
        <a className="portal-card admin-entry" href="#/admin">
          <BarChart3 size={34} />
          <span>管理端</span>
          <strong>智慧景区后台</strong>
          <p>热门问题、情绪趋势、拥堵点、知识未命中、路线转化和运营建议。</p>
        </a>
      </section>
    </main>
  );
}

function VisitorShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="visitor-shell">
      <header className="client-header">
        <a className="brand-mark" href="#/">
          <Sparkles size={22} />
          <span>灵境导游</span>
        </a>
        <div className="client-header-copy">
          <p className="eyebrow">Visitor Client</p>
          <h1>像真人导游一样陪你逛完整个景区</h1>
        </div>
        <div className="header-actions">
          <a className="switch-link" href="#/admin">进入管理端</a>
        </div>
      </header>
      {children}
    </main>
  );
}

function AdminShell({ active, setActive }: { active: AdminTab; setActive: (tab: AdminTab) => void }) {
  return (
    <div className="app-shell admin-shell">
      <aside className="rail">
        <a className="brand-mark" href="#/">
          <Sparkles size={22} />
          <span>灵境后台</span>
        </a>
        <nav className="rail-nav">
          <button className={active === "overview" ? "active" : ""} onClick={() => setActive("overview")}>
            <BarChart3 size={18} />
            运营后台
          </button>
          <button className={active === "knowledge" ? "active" : ""} onClick={() => setActive("knowledge")}>
            <Database size={18} />
            知识库
          </button>
          <button className={active === "finale" ? "active" : ""} onClick={() => setActive("finale")}>
            <Star size={18} />
            夺冠看板
          </button>
        </nav>
        <a className="switch-link in-rail" href="#/visitor">打开游客端</a>
        <div className="rail-proof">
          <ShieldCheck size={18} />
          <div>
            <strong>RAG 可信回答</strong>
            <span>本地知识命中率 94.2%</span>
          </div>
        </div>
      </aside>
      <main className="workspace">
        <AdminHeader active={active} />
        {active === "overview" && <AdminConsole />}
        {active === "knowledge" && <KnowledgeConsole />}
        {active === "finale" && <FinaleConsole />}
      </main>
    </div>
  );
}

function AdminHeader({ active }: { active: AdminTab }) {
  const title = {
    overview: "游客感受度与运营决策后台",
    knowledge: "景区本地知识库管理",
    finale: "夺冠答辩驾驶舱",
  }[active];

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Admin Client / 灵山胜境示范场景</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-metrics">
        <Metric icon={<Gauge size={16} />} label="语音响应" value="4.3s" />
        <Metric icon={<BrainCircuit size={16} />} label="事实准确率" value="94.2%" />
        <Metric icon={<Activity size={16} />} label="今日服务" value="2,186" />
      </div>
    </header>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function VisitorConsole(props: {
  profile: VisitorProfile;
  updateProfile: (next: Partial<VisitorProfile>) => void;
  route: ReturnType<typeof recommendRoute>;
  messages: Message[];
  question: string;
  setQuestion: (question: string) => void;
  ask: (question?: string) => void;
  speaking: boolean;
  voiceState: "idle" | "listening";
  startVoiceDemo: () => void;
  latestAnswer?: Answer;
  voiceConfig: VoiceConfig;
  setVoiceConfig: (config: VoiceConfig) => void;
  voiceMessage: string;
}) {
  const [activeTab, setActiveTab] = useState<VisitorTab>("route");
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<GuideModel["id"]>("mori-miko");
  const {
    profile,
    updateProfile,
    route,
    messages,
    question,
    setQuestion,
    ask,
    speaking,
    voiceState,
    startVoiceDemo,
    latestAnswer,
    voiceConfig,
    setVoiceConfig,
    voiceMessage,
  } = props;
  const selectedGuide = guideModels.find((model) => model.id === selectedGuideId) ?? guideModels[0];

  function playDemoMode() {
    setDemoPlaying(true);
    setActiveTab("route");
    ask("进入评委演示模式：老人同行半日游，从路线生成、地图导航、语音问答到后台闭环依次展示");
    window.setTimeout(() => setActiveTab("chat"), 900);
    window.setTimeout(() => ask("九龙灌浴什么时候开始？如果老人同行怎么避开人流？"), 1300);
    window.setTimeout(() => setActiveTab("photo"), 2400);
    window.setTimeout(() => setActiveTab("safety"), 3400);
    window.setTimeout(() => {
      setActiveTab("route");
      setDemoPlaying(false);
    }, 4700);
  }

  return (
    <section className="visitor-grid">
      <TripStatusBar route={route} profile={profile} ask={ask} playDemoMode={playDemoMode} demoPlaying={demoPlaying} />
      <div className="desktop-map-panel">
        <MapPulsePanel route={route} ask={ask} />
      </div>
      <div className="guide-stage">
        <DigitalHuman
          speaking={speaking}
          mood={latestAnswer?.emotion ?? "中性"}
          model={selectedGuide}
          selectedGuideId={selectedGuideId}
          setSelectedGuideId={setSelectedGuideId}
          onAction={ask}
        />
        <div className="stage-panel">
          <div>
            <p className="eyebrow">当前推荐路线</p>
            <h2>{route.name}</h2>
            <span>{route.duration} / {route.suitable}</span>
          </div>
          <button onClick={() => ask(`按照${profile.interest}和${profile.duration}给我推荐路线`)}>
            <Route size={18} />
            讲解路线
          </button>
        </div>
      </div>

      <div className="mobile-command-dock">
        {[
          { id: "route", label: "路线", icon: <Route size={17} /> },
          { id: "map", label: "地图", icon: <MapPin size={17} /> },
          { id: "chat", label: "问答", icon: <Bot size={17} /> },
          { id: "photo", label: "拍照", icon: <Camera size={17} /> },
          { id: "safety", label: "应急", icon: <ShieldCheck size={17} /> },
          { id: "settings", label: "设置", icon: <Settings size={17} /> },
        ].map((item) => (
          <button key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id as VisitorTab)}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="visitor-tab-surface">
        {activeTab === "route" && (
          <>
            <PlannerPanel profile={profile} updateProfile={updateProfile} route={route} ask={ask} />
            <RouteTimeline route={route} />
            <SmartCompanionPanel ask={ask} />
          </>
        )}
        {activeTab === "map" && (
          <div className="mobile-map-panel">
            <MapPulsePanel route={route} ask={ask} />
          </div>
        )}
        {activeTab === "chat" && (
          <ChatPanel messages={messages} question={question} setQuestion={setQuestion} ask={ask} voiceState={voiceState} startVoiceDemo={startVoiceDemo} />
        )}
        {activeTab === "photo" && <PhotoPanel ask={ask} />}
        {activeTab === "safety" && <EmergencyPanel ask={ask} />}
        {activeTab === "settings" && <VoiceEnginePanel config={voiceConfig} setConfig={setVoiceConfig} message={voiceMessage} />}
      </div>
    </section>
  );
}

function TripStatusBar(props: {
  route: ReturnType<typeof recommendRoute>;
  profile: VisitorProfile;
  ask: (question?: string) => void;
  playDemoMode: () => void;
  demoPlaying: boolean;
}) {
  const { route, profile, ask, playDemoMode, demoPlaying } = props;
  const nextStop = route.spots[1] ?? route.spots[0] ?? "自由游览";

  return (
    <div className="trip-status-bar">
      <div className="trip-primary">
        <span>正在导航</span>
        <strong>{route.name}</strong>
      </div>
      <div className="trip-pill">
        <Clock3 size={16} />
        <span>{route.duration}</span>
      </div>
      <div className="trip-pill">
        <MapPin size={16} />
        <span>下一站：{nextStop}</span>
      </div>
      <div className="trip-pill">
        <Activity size={16} />
        <span>{profile.group} / {profile.pace}</span>
      </div>
      <button onClick={() => ask("按当前位置重新规划最省心路线")}>
        <Navigation size={17} />
        重新规划
      </button>
      <button className="demo-command" onClick={playDemoMode} disabled={demoPlaying}>
        <MonitorPlay size={17} />
        {demoPlaying ? "演示中" : "评委演示"}
      </button>
    </div>
  );
}

function DigitalHuman(props: {
  speaking: boolean;
  mood: Answer["emotion"];
  model: GuideModel;
  selectedGuideId: GuideModel["id"];
  setSelectedGuideId: (id: GuideModel["id"]) => void;
  onAction: (question?: string) => void;
}) {
  const { speaking, mood, model, selectedGuideId, setSelectedGuideId, onAction } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<{
    destroy: (destroyCubism?: boolean) => void;
    resize: () => void;
    centerModel: () => void;
    startMotion: (group: string, index: number, priority: number) => Promise<unknown>;
    setParameter: (parameter: string, value: number) => void;
    scale: number;
    y: number;
  } | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "fallback">("loading");
  const [loadError, setLoadError] = useState("");
  const [interactionMode, setInteractionMode] = useState<"welcome" | "guide" | "photo" | "comfort">("welcome");
  const [pickerOpen, setPickerOpen] = useState(false);

  const interactionCopy = {
    welcome: { label: "迎宾", text: "点我开始智能导览", prompt: "狐娘导游，请先介绍今天最适合我的游览方式" },
    guide: { label: "指路", text: "我来带你走下一站", prompt: "狐娘导游，带我去下一站并说明怎么走" },
    photo: { label: "拍照", text: "帮你找最佳机位", prompt: "狐娘导游，推荐附近最好看的拍照机位" },
    comfort: { label: "安抚", text: "累了就换舒缓路线", prompt: "狐娘导游，我有点累，请改成舒缓路线" },
  };

  function cycleInteraction() {
    const order: (keyof typeof interactionCopy)[] = ["welcome", "guide", "photo", "comfort"];
    const next = order[(order.indexOf(interactionMode) + 1) % order.length];
    setInteractionMode(next);
    applyInteractionPose(next);
    onAction(interactionCopy[next].prompt);
  }

  function applyInteractionPose(mode: keyof typeof interactionCopy) {
    const model = modelRef.current;
    if (!model) return;
    const value = mode === "guide" ? 10 : mode === "photo" ? -8 : mode === "comfort" ? 4 : 0;
    model.setParameter("ParamAngleX", value);
    model.setParameter("ParamAngleY", mode === "comfort" ? -5 : 0);
    model.setParameter("ParamAngleZ", mode === "photo" ? -4 : mode === "guide" ? 3 : 0);
    model.setParameter("ParamMouthForm", mode === "comfort" ? -0.4 : 0.55);
    model.setParameter("ParamMouthOpenY", mode === "welcome" ? 0.18 : 0.32);
    model.setParameter("ParamEyeLOpen", mode === "comfort" ? 0.72 : 1);
    model.setParameter("ParamEyeROpen", mode === "comfort" ? 0.72 : 1);
  }

  function followPointer(event: React.PointerEvent<HTMLDivElement>) {
    const liveModel = modelRef.current;
    if (!liveModel) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 24;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -16;
    liveModel.setParameter("ParamAngleX", x);
    liveModel.setParameter("ParamAngleY", y);
    liveModel.setParameter("ParamBodyAngleX", x * 0.35);
  }

  function resetPointerPose() {
    const liveModel = modelRef.current;
    if (!liveModel) return;
    liveModel.setParameter("ParamAngleX", 0);
    liveModel.setParameter("ParamAngleY", 0);
    liveModel.setParameter("ParamBodyAngleX", 0);
  }

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const liveCanvas = canvas;
    setLoadState("loading");
    setLoadError("");
    modelRef.current?.destroy(false);
    modelRef.current = null;

    const resizeCanvas = () => {
      const rect = liveCanvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      liveCanvas.width = Math.max(1, Math.floor(rect.width * ratio));
      liveCanvas.height = Math.max(1, Math.floor(rect.height * ratio));
      modelRef.current?.resize();
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(liveCanvas);

    async function loadModel() {
      try {
        const { Live2DCubismModel } = await import("live2d-renderer");
        if (cancelled) return;
        const liveModel = new Live2DCubismModel(liveCanvas, {
          cubismCorePath: "/live2d/live2dcubismcore.min.js",
          autoAnimate: true,
          autoInteraction: true,
          tapInteraction: true,
          randomMotion: false,
          keepAspect: false,
          zoomEnabled: false,
          enablePan: false,
          doubleClickReset: false,
          scale: model.scale,
          y: model.y,
          appendYOffset: model.y,
          enableLipsync: true,
        });
        await liveModel.load(model.path);
        if (cancelled) {
          liveModel.destroy(false);
          return;
        }
        modelRef.current = liveModel;
        liveModel.centerModel();
        liveModel.scale = model.scale;
        liveModel.y = model.y;
        setLoadState("ready");
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Live2D 加载失败");
        setLoadState("fallback");
      }
    }

    loadModel();

    return () => {
      cancelled = true;
      observer.disconnect();
      modelRef.current?.destroy(false);
      modelRef.current = null;
    };
  }, [model]);

  useEffect(() => {
    if (!modelRef.current) return;
    const id = window.setInterval(() => {
      modelRef.current?.setParameter("ParamMouthOpenY", speaking ? 0.25 + Math.random() * 0.55 : 0);
      modelRef.current?.setParameter("ParamAngleX", speaking ? Math.sin(Date.now() / 420) * 6 : 0);
    }, 120);
    return () => window.clearInterval(id);
  }, [speaking]);

  return (
    <div className={`digital-human ${speaking ? "speaking" : ""}`} onPointerMove={followPointer} onPointerLeave={resetPointerPose}>
      <div className="aura" />
      <button className="human-hit-area" onClick={cycleInteraction} aria-label="和狐娘导游互动" />
      <canvas ref={canvasRef} className={`live2d-canvas ${loadState === "ready" ? "ready" : ""}`} onClick={cycleInteraction} />
      <div className={`avatar fallback-avatar ${loadState === "fallback" ? "show" : ""}`}>
        <div className="hair" />
        <div className="face">
          <span className="eye left" />
          <span className="eye right" />
          <span className={`mouth ${speaking ? "talk" : ""}`} />
        </div>
        <div className="robe"><span /></div>
      </div>
      <div className="live2d-source">
        <span title={loadError}>{loadState === "ready" ? "Live2D 模型已加载" : loadState === "loading" ? "正在加载 Live2D" : `模型加载失败：${loadError || "备用形象"}`}</span>
        <b>Eikanya / {model.source}</b>
      </div>
      <div className={`guide-model-picker ${pickerOpen ? "open" : ""}`} aria-label="选择 AI 导游形象">
        <button className="guide-pet-switch" onClick={() => setPickerOpen((open) => !open)} title="切换桌宠形象">
          <Bot size={16} />
          <span>{model.label}</span>
        </button>
        <div className="guide-pet-drawer">
          {guideModels.map((item) => (
            <button
              key={item.id}
              className={selectedGuideId === item.id ? "active" : ""}
              onClick={() => {
                setSelectedGuideId(item.id);
                setPickerOpen(false);
                onAction(`切换为${item.label}形象，继续用${item.tone}风格为我导览`);
              }}
              title={`${item.label} / ${item.tone}`}
            >
              <span>{item.label}</span>
              <b>{item.tone}</b>
            </button>
          ))}
        </div>
      </div>
      <div className="human-caption">
        <Radio size={16} />
        <span>{speaking ? "正在语音讲解" : `${interactionCopy[interactionMode].label}模式 / 情绪：${mood}`}</span>
      </div>
      <div className="human-interactions">
        {(Object.keys(interactionCopy) as Array<keyof typeof interactionCopy>).map((key) => (
          <button
            key={key}
            className={interactionMode === key ? "active" : ""}
            onClick={() => {
              setInteractionMode(key);
              applyInteractionPose(key);
              onAction(interactionCopy[key].prompt);
            }}
          >
            {interactionCopy[key].label}
          </button>
        ))}
      </div>
      <button className="human-speech-bubble" onClick={cycleInteraction}>
        {interactionCopy[interactionMode].text}
      </button>
    </div>
  );
}

function PlannerPanel({ profile, updateProfile, route, ask }: { profile: VisitorProfile; updateProfile: (next: Partial<VisitorProfile>) => void; route: ReturnType<typeof recommendRoute>; ask: (question?: string) => void }) {
  const options: { key: keyof VisitorProfile; label: string; values: VisitorProfile[keyof VisitorProfile][] }[] = [
    { key: "interest", label: "兴趣", values: ["历史文化", "自然风光", "亲子互动", "拍照打卡", "休闲祈福", "研学讲解"] },
    { key: "duration", label: "时长", values: ["1小时", "2小时", "半日", "全天"] },
    { key: "group", label: "同行", values: ["独自", "情侣", "朋友", "亲子", "老人同行", "团队"] },
    { key: "pace", label: "节奏", values: ["轻松", "适中", "深度"] },
    { key: "narration", label: "讲法", values: ["温柔导游", "活泼伙伴", "研学老师", "长辈友好"] },
  ];

  return (
    <aside className="side-panel planner-panel">
      <PanelTitle icon={<UserRound size={18} />} title="我的游览方案" />
      <div className="planner-form">
        {options.map((group) => (
          <label className="select-row" key={group.key}>
            <span>{group.label}</span>
            <select value={profile[group.key]} onChange={(event) => updateProfile({ [group.key]: event.target.value } as Partial<VisitorProfile>)}>
              {group.values.map((value) => <option value={value} key={value}>{value}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="planner-result">
        <strong>{route.name}</strong>
        <span>{route.duration}</span>
        <p>{route.crowdStrategy}</p>
      </div>
      <button className="wide-command" onClick={() => ask("根据我的画像生成完整游览方案")}>
        <TicketCheck size={18} />
        生成完整方案
      </button>
    </aside>
  );
}

function ChatPanel(props: {
  messages: Message[];
  question: string;
  setQuestion: (question: string) => void;
  ask: (question?: string) => void;
  voiceState: "idle" | "listening";
  startVoiceDemo: () => void;
}) {
  const { messages, question, setQuestion, ask, voiceState, startVoiceDemo } = props;

  return (
    <div className="chat-panel">
      <div className="chat-stream">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
            <div className="message-role">{message.role === "guide" ? "AI 数字人" : "游客"}</div>
            <p>{message.text}</p>
            {message.answer && <Evidence answer={message.answer} />}
          </div>
        ))}
      </div>
      <div className="composer">
        <button className={voiceState === "listening" ? "recording" : ""} onClick={startVoiceDemo} aria-label="语音输入演示">
          <Mic size={20} />
        </button>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === "Enter" && ask()} placeholder="问我路线、景点、拍照、休息点或演出时间" />
        <button onClick={() => ask()} aria-label="发送问题">
          <Send size={20} />
        </button>
      </div>
      <div className="quick-prompts">
        {["我带孩子，讲得有趣一点", "哪里拍灵山大佛最好看？", "下雨了还能怎么逛？", "我走累了，找休息点"].map((item) => (
          <button key={item} onClick={() => ask(item)}>{item}</button>
        ))}
      </div>
    </div>
  );
}

function Evidence({ answer }: { answer: Answer }) {
  return (
    <div className="evidence-box">
      <div className="evidence-head">
        <BookOpen size={15} />
        <span>{answer.intent} / {answer.emotion}</span>
      </div>
      {answer.hits.length > 0 ? (
        answer.hits.map((hit) => (
          <div className="hit" key={hit.source}>
            <strong>{hit.title}</strong>
            <span>{hit.source} / 置信度 {hit.score}%</span>
          </div>
        ))
      ) : (
        <div className="hit">
          <strong>无知识命中</strong>
          <span>已进入后台待补充问题池</span>
        </div>
      )}
    </div>
  );
}

function SmartCompanionPanel({ ask }: { ask: (question?: string) => void }) {
  return (
    <aside className="side-panel companion-panel">
      <PanelTitle icon={<Sparkles size={18} />} title="数字人主动提醒" />
      <div className="alert-stack">
        {proactiveAlerts.map((item) => (
          <button key={item.title} onClick={() => ask(item.action)}>
            <span>{item.level}</span>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}

function RouteTimeline({ route }: { route: ReturnType<typeof recommendRoute> }) {
  return (
    <aside className="side-panel timeline-panel">
      <PanelTitle icon={<Clock3 size={18} />} title="行程时间轴" />
      <div className="route-summary">
        <strong>{route.name}</strong>
        <span>{route.spots.join(" → ")}</span>
      </div>
      <div className="timeline-list">
        {timelineTasks.map((item) => (
          <article key={item.time} className={item.status === "当前" ? "active" : ""}>
            <time>{item.time}</time>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <span>{item.status}</span>
          </article>
        ))}
      </div>
    </aside>
  );
}

function MapPulsePanel({ route, ask }: { route: ReturnType<typeof recommendRoute>; ask: (question?: string) => void }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [segmentProgress, setSegmentProgress] = useState(0);
  const [navigationActive, setNavigationActive] = useState(false);
  const [showAllPois, setShowAllPois] = useState(false);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showRouteList, setShowRouteList] = useState(false);
  const [selectedMapItem, setSelectedMapItem] = useState(route.spots[0] ?? "");
  const routeNodes = route.spots
    .map((name) => spots.find((node) => node.name === name))
    .filter((node): node is (typeof spots)[number] => Boolean(node));
  const current = routeNodes[0];
  const next = routeNodes[1];
  const routeStepNames = new Set(route.spots);
  const matchedSteps = realSceneSteps.filter((step) => routeStepNames.has(step.from) || routeStepNames.has(step.to));
  const sceneSteps = matchedSteps.length >= 3 ? matchedSteps : realSceneSteps.slice(0, 6);
  const activeStep = sceneSteps[Math.min(activeStepIndex, sceneSteps.length - 1)] ?? realSceneSteps[0];
  const activeStepProgress = sceneSteps.length > 0 ? Math.round(((activeStepIndex + segmentProgress / 100) / sceneSteps.length) * 100) : 0;
  const activeFromNode = spots.find((node) => node.name === activeStep.from) ?? current;
  const activeToNode = spots.find((node) => node.name === activeStep.to) ?? next ?? current;

  useEffect(() => {
    setActiveStepIndex(0);
    setSegmentProgress(0);
    setNavigationActive(false);
    setSelectedMapItem(route.spots[0] ?? "");
  }, [route.name, route.spots]);

  function startNavigation(index = activeStepIndex) {
    const nextIndex = Math.min(index, sceneSteps.length - 1);
    const step = sceneSteps[nextIndex];
    if (!step) return;
    setActiveStepIndex(nextIndex);
    setSegmentProgress(0);
    setNavigationActive(true);
    setSelectedMapItem(step.from);
    ask(`开始景区导览图导航：从${step.from}到${step.to}。请告诉我下一步怎么走`);
  }

  function moveNavigation(direction: "next" | "previous") {
    const offset = direction === "next" ? 1 : -1;
    const nextIndex = Math.min(Math.max(activeStepIndex + offset, 0), sceneSteps.length - 1);
    setActiveStepIndex(nextIndex);
    setSegmentProgress(0);
    const step = sceneSteps[nextIndex];
    if (step) setSelectedMapItem(step.from);
    if (step) ask(`继续导航：从${step.from}到${step.to}`);
  }

  function advanceNavigation() {
    if (!activeStep) return;

    const nextProgress = Math.min((navigationActive ? segmentProgress : 0) + 25, 100);
    setNavigationActive(true);

    if (nextProgress >= 100) {
      setSelectedMapItem(activeStep.to);
    } else {
      setSelectedMapItem(activeStep.from);
    }

    if (nextProgress >= 100 && activeStepIndex < sceneSteps.length - 1) {
      const nextIndex = activeStepIndex + 1;
      const nextStep = sceneSteps[nextIndex];
      setActiveStepIndex(nextIndex);
      setSegmentProgress(0);
      if (nextStep) {
        setSelectedMapItem(nextStep.from);
        ask(`已到达${activeStep.to}，继续前往${nextStep.to}`);
      }
      return;
    }

    if (nextProgress >= 100) {
      setSegmentProgress(100);
      ask(`已到达${activeStep.to}，当前路线已完成。`);
      return;
    }

    setSegmentProgress(nextProgress);
    ask(`模拟定位前进到当前路段 ${nextProgress}%：${activeStep.from}前往${activeStep.to}`);
  }

  return (
    <aside className="side-panel map-pulse">
      <div className="map-headline">
        <PanelTitle icon={<MapPin size={18} />} title="高德式景区导航" />
        <div className="map-mode-switch">
          <button className="active">
            <Compass size={15} />
            景区导览图
          </button>
        </div>
      </div>
      <div className="map-status">
        <div>
          <span>{navigationActive ? "正在导航" : "导览图定位"}</span>
          <strong>{activeStep.from}</strong>
        </div>
        <div>
          <span>下一站</span>
          <strong>{activeStep.to}</strong>
        </div>
        <b>{activeStep.distance} / {activeStep.minutes} 分钟</b>
      </div>
      {navigationActive && (
        <div className="navigation-live-card">
          <div>
            <span>路线进度 {activeStepIndex + 1}/{sceneSteps.length}</span>
            <strong>{activeStep.from} → {activeStep.to}</strong>
          </div>
          <div className="navigation-progress" aria-label={`导航进度 ${activeStepProgress}%`}>
            <span style={{ width: `${activeStepProgress}%` }} />
          </div>
          <p>{activeStep.hint} 当前路段已前进 {segmentProgress}%。</p>
        </div>
      )}
      <div className="mini-map scenic-map guide-map-mode" aria-label="景区 2D 导览图导航">
        <ScenicGuideMapView
          route={route}
          activeStep={activeStep}
          navigationActive={navigationActive}
          segmentProgress={segmentProgress}
          advanceNavigation={advanceNavigation}
          selectedMapItem={selectedMapItem}
          setSelectedMapItem={setSelectedMapItem}
          showAllPois={showAllPois}
          showFacilities={showFacilities}
          ask={ask}
        />
      </div>
      <RealSceneNavigation
        steps={sceneSteps}
        activeIndex={activeStepIndex}
        navigationActive={navigationActive}
        showRouteList={showRouteList}
        setActiveIndex={(index) => {
          setActiveStepIndex(index);
          setSegmentProgress(0);
          setNavigationActive(true);
        }}
        toggleRouteList={() => setShowRouteList((current) => !current)}
        startNavigation={startNavigation}
        moveNavigation={moveNavigation}
        advanceNavigation={advanceNavigation}
        stopNavigation={() => {
          setNavigationActive(false);
          setSegmentProgress(0);
        }}
        ask={ask}
      />
      <div className="map-layer-controls">
        <button className={showAllPois ? "active" : ""} onClick={() => setShowAllPois((current) => !current)}>
          <MapPin size={15} />
          全部景点
        </button>
        <button className={showFacilities ? "active" : ""} onClick={() => setShowFacilities((current) => !current)}>
          <ShieldCheck size={15} />
          服务点
        </button>
      </div>
      <div className="map-actions">
        {routeNodes.slice(0, 3).map((node, index) => (
          <div key={node.name} onClick={() => ask(`讲解${node.name}`)}>
            <strong>{index + 1}. {node.name}</strong>
            <span>{node.category} / 热度 {node.heat} / {node.openInfo}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ScenicGuideMapView(props: {
  route: ReturnType<typeof recommendRoute>;
  activeStep: (typeof realSceneSteps)[number];
  navigationActive: boolean;
  segmentProgress: number;
  advanceNavigation: () => void;
  selectedMapItem: string;
  setSelectedMapItem: (name: string) => void;
  showAllPois: boolean;
  showFacilities: boolean;
  ask: (question?: string) => void;
}) {
  const { route, activeStep, navigationActive, segmentProgress, advanceNavigation, selectedMapItem, setSelectedMapItem, showAllPois, showFacilities, ask } = props;
  const routeNodes = route.spots
    .map((name) => spots.find((node) => node.name === name))
    .filter((node): node is (typeof spots)[number] => Boolean(node));
  const routePoints = routeNodes
    .map((node) => getGuideMapPosition(node.name, node))
    .map((position) => `${position.x},${position.y}`)
    .join(" ");
  const fromNode = spots.find((node) => node.name === activeStep.from) ?? routeNodes[0];
  const toNode = spots.find((node) => node.name === activeStep.to) ?? routeNodes[1] ?? routeNodes[0];
  const fromPosition = fromNode ? getGuideMapPosition(fromNode.name, fromNode) : null;
  const toPosition = toNode ? getGuideMapPosition(toNode.name, toNode) : fromPosition;
  const currentPosition = fromPosition && toPosition && navigationActive ? interpolateMapPosition(fromPosition, toPosition, segmentProgress) : fromPosition;
  const selectedSpot = spots.find((spot) => spot.name === selectedMapItem);
  const selectedFacility = facilities.find((facility) => facility.name === selectedMapItem);
  const selectedPoi = realScenePois.find((poi) => poi.name === selectedMapItem);
  const selectedPhoto = getSpotPhoto(selectedMapItem);

  return (
    <div className="guide-map-shell">
      <img src="/maps/lingshan-guide-map.png" alt="灵山胜境景区 2D 游览图" className="guide-map-image" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="guide-route-layer">
        {routePoints && <polyline className="guide-route-glow" points={routePoints} />}
        {routePoints && <polyline className="guide-route" points={routePoints} />}
      </svg>

      <div className="guide-map-topbar">
        <div>
          <span>景区 2D 导览图</span>
          <strong>{navigationActive ? `${activeStep.from} → ${activeStep.to}` : "灵山胜境官方游览图"}</strong>
        </div>
        <b>图源：灵山官网</b>
      </div>

      {spots.filter((node) => showAllPois || route.spots.includes(node.name) || node.name === activeStep.from || node.name === activeStep.to).map((node) => {
        const routeIndex = route.spots.indexOf(node.name);
        const isActiveFrom = node.name === fromNode?.name;
        const isActiveTo = node.name === toNode?.name;
        const position = getGuideMapPosition(node.name, node);
        return (
          <button
            key={node.name}
            className={[
              "guide-map-poi",
              routeIndex >= 0 ? "on-route" : "",
              isActiveFrom ? "nav-from" : "",
              isActiveTo ? "nav-to" : "",
            ].filter(Boolean).join(" ")}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            title={`${node.name}：热度 ${node.heat}`}
            onClick={() => {
              setSelectedMapItem(node.name);
              ask(`在景区导览图上讲解${node.name}`);
            }}
          >
            <span>{routeIndex >= 0 ? routeIndex + 1 : ""}</span>
            <b>{node.name}</b>
          </button>
        );
      })}

      {realScenePois.map((poi) => (
        <button
          key={poi.name}
          className={`guide-scene-poi poi-${poi.type}`}
          style={{ left: `${getGuideMapPosition(poi.name, poi).x}%`, top: `${getGuideMapPosition(poi.name, poi).y}%` }}
          title={`${poi.name}：${poi.detail}`}
          onClick={() => {
            setSelectedMapItem(poi.name);
            ask(`在景区导览图上定位${poi.name}：${poi.detail}`);
          }}
        >
          {poi.icon}
        </button>
      ))}

      {showFacilities && facilities.map((facility) => (
        <button
          key={facility.name}
          className="guide-facility"
          style={{ left: `${getGuideMapPosition(facility.name, facility).x}%`, top: `${getGuideMapPosition(facility.name, facility).y}%` }}
          title={`${facility.type}：${facility.name}`}
          onClick={() => {
            setSelectedMapItem(facility.name);
            ask(`景区导览图带我去${facility.name}`);
          }}
        >
          {facility.icon}
        </button>
      ))}

      {currentPosition && (
        <button
          className={`guide-location ${navigationActive ? "moving" : ""}`}
          style={{ left: `${currentPosition.x}%`, top: `${currentPosition.y}%` }}
          title={`当前位置：${navigationActive ? `${activeStep.from}前往${activeStep.to} ${segmentProgress}%` : fromNode?.name}`}
          onClick={() => ask(`我现在在${activeStep.from}到${activeStep.to}之间，进度${segmentProgress}%，下一步怎么走？`)}
        >
          <Navigation size={18} />
        </button>
      )}

      {(selectedSpot || selectedFacility || selectedPoi) && (
        <div className="guide-spot-card">
          <div className="guide-spot-photo">
            <img key={selectedPhoto.image} src={selectedPhoto.image} alt={selectedPhoto.label} />
            <span>{selectedPhoto.label}</span>
          </div>
          <div className="guide-spot-content">
            <div>
              <span>{selectedSpot ? selectedSpot.category : selectedFacility ? selectedFacility.type : selectedPoi?.type}</span>
              <strong>{selectedMapItem}</strong>
            </div>
            <p>{selectedSpot ? briefText(selectedSpot.description) : selectedFacility ? `${selectedFacility.name}，当前拥挤度：${selectedFacility.crowd}。` : selectedPoi?.detail}</p>
            {selectedSpot && (
              <div className="guide-spot-meta">
                <b>热度 {selectedSpot.heat}</b>
                <b>{selectedSpot.duration} 分钟</b>
                <b>{selectedSpot.tags[0]}</b>
              </div>
            )}
            <div className="guide-spot-actions">
              <button onClick={() => ask(`详细讲解${selectedMapItem}`)}>讲解</button>
              <button onClick={() => ask(`带我去${selectedMapItem}`)}>导航</button>
            </div>
          </div>
        </div>
      )}

      <div className="guide-map-bottom-sheet">
        <span>{navigationActive ? "导览图导航中" : "导览图路线已规划"}</span>
        <strong>{activeStep.hint}{navigationActive ? ` 已前进 ${segmentProgress}%。` : ""}</strong>
        <button onClick={advanceNavigation}>
          <Navigation size={16} />
          {navigationActive ? "模拟前进" : "开始"}
        </button>
      </div>
    </div>
  );
}

function RealSceneViewport(props: { step: (typeof realSceneSteps)[number]; navigationActive: boolean; ask: (question?: string) => void }) {
  const { step, navigationActive, ask } = props;
  return (
    <div className="scene-viewport">
      <div className="scene-sky" />
      <div className="scene-ground" />
      <div className="scene-corridor">
        <span />
        <span />
        <span />
      </div>
      <div className="scene-direction">
        <Compass size={18} />
        <div>
          <span>{navigationActive ? "导航中" : step.bearing}</span>
          <strong>{step.to}</strong>
        </div>
      </div>
      <button className="scene-landmark" onClick={() => ask(`识别地标：${step.landmark}`)}>
        <Camera size={16} />
        {step.landmark}
      </button>
      <div className="scene-instruction">
        <strong>{step.from} → {step.to}</strong>
        <p>{step.hint}</p>
      </div>
    </div>
  );
}

function RealSceneNavigation(props: {
  steps: typeof realSceneSteps;
  activeIndex: number;
  navigationActive: boolean;
  showRouteList: boolean;
  setActiveIndex: (index: number) => void;
  toggleRouteList: () => void;
  startNavigation: (index?: number) => void;
  moveNavigation: (direction: "next" | "previous") => void;
  advanceNavigation: () => void;
  stopNavigation: () => void;
  ask: (question?: string) => void;
}) {
  const { steps, activeIndex, navigationActive, showRouteList, setActiveIndex, toggleRouteList, startNavigation, moveNavigation, advanceNavigation, stopNavigation, ask } = props;
  const activeStep = steps[activeIndex];
  return (
    <div className={`real-scene-nav ${navigationActive ? "is-navigating" : ""}`}>
      <div className="scene-nav-head">
        <div>
          <span>{navigationActive ? "导航已启动" : "导览图步行导航"}</span>
          <strong>{steps[activeIndex]?.from} → {steps[activeIndex]?.to}</strong>
        </div>
        <div className="scene-nav-controls">
          {navigationActive && (
            <button onClick={() => moveNavigation("previous")} disabled={activeIndex === 0}>
              上一段
            </button>
          )}
          <button className="primary" onClick={() => navigationActive ? moveNavigation("next") : startNavigation(activeIndex)} disabled={navigationActive && activeIndex === steps.length - 1}>
            <Navigation size={16} />
            {navigationActive ? "下一段" : "开始"}
          </button>
          {navigationActive && (
            <button onClick={advanceNavigation}>
              前进
            </button>
          )}
          {navigationActive && (
            <button onClick={stopNavigation}>
              结束
            </button>
          )}
          <button onClick={toggleRouteList}>
            {showRouteList ? "收起" : "全程"}
          </button>
        </div>
      </div>
      {activeStep && (
        <div className="active-step-card">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <div>
            <strong>{activeStep.to}</strong>
            <p>{activeStep.hint}</p>
          </div>
          <b>{activeStep.distance} / {activeStep.minutes} 分钟</b>
        </div>
      )}
      <div className={`scene-strip ${showRouteList ? "expanded" : "collapsed"}`}>
        {(showRouteList ? steps : steps.slice(Math.max(0, activeIndex - 1), Math.min(steps.length, activeIndex + 2))).map((step, scopedIndex) => {
          const index = showRouteList ? scopedIndex : Math.max(0, activeIndex - 1) + scopedIndex;
          return (
          <button
            key={`${step.from}-${step.to}`}
            className={activeIndex === index ? "active" : ""}
            onClick={() => {
              setActiveIndex(index);
              ask(`导航到第${index + 1}段：从${step.from}到${step.to}`);
            }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.to}</strong>
            <em>{step.distance} / {step.minutes} 分钟</em>
            <p>{step.view}</p>
            <b>{step.landmark}</b>
          </button>
          );
        })}
      </div>
    </div>
  );
}

function PhotoPanel({ ask }: { ask: (question?: string) => void }) {
  return (
    <aside className="side-panel photo-panel">
      <PanelTitle icon={<Camera size={18} />} title="拍照打卡推荐" />
      <div className="photo-grid">
        {photoRecommendations.map((item) => (
          <button key={item.spot} onClick={() => ask(`${item.spot}怎么拍照好看？`)}>
            <span>{item.score}</span>
            <strong>{item.spot}</strong>
            <em>{item.angle} / {item.bestTime}</em>
            <p>{item.tip}</p>
          </button>
        ))}
      </div>
      <button className="wide-command secondary" onClick={() => ask("模拟拍照识别当前景点")}>
        <Camera size={18} />
        拍照识别景点
      </button>
    </aside>
  );
}

function EmergencyPanel({ ask }: { ask: (question?: string) => void }) {
  return (
    <aside className="side-panel emergency-panel">
      <PanelTitle icon={<AlertTriangle size={18} />} title="应急与无障碍" />
      <div className="emergency-grid">
        {emergencyPlans.map((item) => (
          <button key={item.name} onClick={() => ask(item.name)}>
            <strong>{item.name}</strong>
            <p>{item.detail}</p>
            <span>{item.tags.join(" / ")}</span>
          </button>
        ))}
      </div>
      <div className="help-card">
        <PhoneCall size={18} />
        <div>
          <strong>一键求助卡</strong>
          <span>当前位置：灵山照壁附近 / 最近咨询台约 260 米</span>
        </div>
      </div>
    </aside>
  );
}

function VoiceEnginePanel({ config, setConfig, message }: { config: VoiceConfig; setConfig: (config: VoiceConfig) => void; message: string }) {
  return (
    <aside className="side-panel voice-panel">
      <PanelTitle icon={<Volume2 size={18} />} title="开源语音模型" />
      <div className="voice-toggle">
        <button className={config.engine === "open-source-local" ? "active" : ""} onClick={() => setConfig({ ...config, engine: "open-source-local" })}>本地开源 TTS</button>
        <button className={config.engine === "browser" ? "active" : ""} onClick={() => setConfig({ ...config, engine: "browser" })}>浏览器回退</button>
      </div>
      <label className="select-row">
        <span>OpenAI-compatible TTS 地址</span>
        <input value={config.endpoint} onChange={(event) => setConfig({ ...config, endpoint: event.target.value })} />
      </label>
      <div className="voice-grid">
        <label className="select-row">
          <span>模型</span>
          <input value={config.model} onChange={(event) => setConfig({ ...config, model: event.target.value })} />
        </label>
        <label className="select-row">
          <span>音色</span>
          <input value={config.voice} onChange={(event) => setConfig({ ...config, voice: event.target.value })} />
        </label>
      </div>
      <p>{message}</p>
      <small>可接 CosyVoice、ChatTTS、IndexTTS 或 LocalAI 的免费开源本地服务。</small>
    </aside>
  );
}

function AdminConsole() {
  return (
    <section className="admin-grid">
      <div className="stat-card wide insight-strip">
        {aiInsightCards.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
          </article>
        ))}
      </div>
      <DigitalTwinCard />
      <div className="stat-card wide">
        <PanelTitle icon={<HeartPulse size={18} />} title="满意度与客流趋势" />
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={satisfactionTrend}>
            <defs>
              <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d8b766" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#d8b766" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#9aa89f" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9aa89f" }} axisLine={false} tickLine={false} domain={[3.8, 5]} />
            <Tooltip contentStyle={{ background: "#101713", border: "1px solid rgba(216,183,102,.25)", color: "#f6efe0" }} />
            <Area type="monotone" dataKey="score" stroke="#d8b766" fill="url(#score)" strokeWidth={3} />
            <Line type="monotone" dataKey="emotion" stroke="#74c7b0" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="stat-card">
        <PanelTitle icon={<Activity size={18} />} title="路线完成率" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={routeConversion}>
            <XAxis dataKey="name" tick={{ fill: "#9aa89f", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "#101713", border: "1px solid rgba(216,183,102,.25)", color: "#f6efe0" }} />
            <Bar dataKey="generated" radius={[4, 4, 0, 0]} fill="rgba(216,183,102,.34)" />
            <Bar dataKey="completed" radius={[4, 4, 0, 0]} fill="#74c7b0" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="stat-card">
        <PanelTitle icon={<BrainCircuit size={18} />} title="游客情绪分布" />
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={emotionTrend} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>
              {emotionTrend.map((entry, index) => <Cell key={entry.name} fill={chartColors[index]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#101713", border: "1px solid rgba(216,183,102,.25)", color: "#f6efe0" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="legend-list">
          {emotionTrend.map((item, index) => <span key={item.name}><i style={{ background: chartColors[index] }} />{item.name} {item.value}%</span>)}
        </div>
      </div>
      <div className="stat-card">
        <PanelTitle icon={<BookOpen size={18} />} title="热门问答" />
        <div className="rank-list">
          {hotQuestions.map((item, index) => (
            <div key={item.topic}>
              <span>{index + 1}</span>
              <strong>{item.topic}</strong>
              <em>{item.count}</em>
              <b>{item.trend}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="stat-card">
        <PanelTitle icon={<Database size={18} />} title="知识未命中工单" />
        <div className="ticket-list">
          {unresolvedQuestions.map((item) => (
            <article key={item.question}>
              <strong>{item.question}</strong>
              <span>{item.times} 次 / {item.owner}</span>
            </article>
          ))}
        </div>
      </div>
      <div className="stat-card wide">
        <PanelTitle icon={<Sparkles size={18} />} title="AI 运营建议" />
        <div className="suggestion-grid">
          {operationSuggestions.map((item) => (
            <div key={item}>
              <ShieldCheck size={17} />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DigitalTwinCard() {
  return (
    <div className="stat-card twin-card">
      <PanelTitle icon={<Map size={18} />} title="景区数字孪生热力" />
      <div className="twin-map">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 18 78 C 35 62, 48 48, 62 66 S 70 36, 74 24" />
        </svg>
        {spots.map((spot) => (
          <span key={spot.id} style={{ left: `${spot.x}%`, top: `${spot.y}%`, "--heat": `${spot.heat / 100}` } as React.CSSProperties}>
            {spot.heat}
          </span>
        ))}
      </div>
      <div className="twin-legend">
        <span><Waves size={15} /> 人流热度</span>
        <span><Navigation size={15} /> 推荐动线</span>
        <span><Home size={15} /> 设施分布</span>
      </div>
    </div>
  );
}

function KnowledgeConsole() {
  return (
    <section className="knowledge-grid">
      <div className="upload-zone">
        <Upload size={28} />
        <h2>知识库上传与解析</h2>
        <p>支持 DOCX、XLSX、PDF、Markdown。当前演示已导入官方示范资料包，并按景点、文化内涵、游览亮点、开放信息和运营 FAQ 切分。</p>
        <button>
          <RefreshCcw size={18} />
          模拟重新向量化
        </button>
      </div>
      <div className="knowledge-list">
        {spots.map((spot) => (
          <article key={spot.id}>
            <div>
              <strong>{spot.name}</strong>
              <span>{spot.id} / {spot.category}</span>
            </div>
            <p>{spot.description}</p>
            <footer>{spot.tags.map((tag) => <b key={tag}>{tag}</b>)}</footer>
          </article>
        ))}
      </div>
      <div className="faq-panel quality-panel">
        <PanelTitle icon={<Gauge size={18} />} title="知识库质量闸门" />
        {knowledgeQuality.map((item) => (
          <div className="quality-row" key={item.metric}>
            <div>
              <strong>{item.metric}</strong>
              <span>{item.value}{item.unit}</span>
            </div>
            <meter min="0" max="100" value={item.health} />
          </div>
        ))}
      </div>
      <div className="faq-panel">
        <PanelTitle icon={<BrainCircuit size={18} />} title="标准问答测试集" />
        {faq.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
            <span>{item.source}</span>
          </details>
        ))}
      </div>
      <div className="faq-panel">
        <PanelTitle icon={<Settings size={18} />} title="数字人配置" />
        {["Eikanya/Fox Hime Zero 狐娘模型", "本地开源 TTS", "讲解/思考/安抚表情", "语音字幕同步", "儿童/老人/研学讲法"].map((item) => (
          <div className="config-row" key={item}>
            <Volume2 size={16} />
            <span>{item}</span>
            <b>已启用</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinaleConsole() {
  const total = scoreMatrix.reduce((sum, item) => sum + item.current, 0);

  return (
    <section className="finale-grid">
      <div className="finale-hero">
        <div>
          <p className="eyebrow">Championship Narrative</p>
          <h2>把数字人导览做成完整的智慧景区运营闭环</h2>
          <p>答辩主线不是炫模型，而是证明系统能解决真实景区问题：游客问得到、听得懂、走得顺；管理者看得见、改得动、能决策。</p>
        </div>
        <div className="finale-score">
          <span>预计竞争力</span>
          <strong>{total}</strong>
          <em>/100</em>
        </div>
      </div>
      <div className="score-grid">
        {scoreMatrix.map((item) => (
          <article key={item.item}>
            <div>
              <strong>{item.item}</strong>
              <span>{item.current}/{item.score}</span>
            </div>
            <meter min="0" max={item.score} value={item.current} />
            <p>{item.proof}</p>
          </article>
        ))}
      </div>
      <div className="demo-board">
        <PanelTitle icon={<MonitorPlay size={18} />} title="7 分钟演示脚本" />
        <div className="demo-timeline">
          {demoScript.map((step) => (
            <article key={step.time}>
              <time>{step.time}</time>
              <div>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="demo-board">
        <PanelTitle icon={<Play size={18} />} title="评委可感知亮点" />
        <div className="winning-points">
          {[
            "游客端与管理端完全分离，符合真实产品部署方式。",
            "Live2D 形象来自指定模型仓库，并已本地化加载。",
            "回答展示知识命中来源，降低大模型幻觉风险。",
            "地图、路线、情绪、拍照、应急和后台工单形成完整闭环。",
          ].map((point) => (
            <div key={point}>
              <Sparkles size={16} />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PanelTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="panel-title">
      {icon}
      <h3>{title}</h3>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
