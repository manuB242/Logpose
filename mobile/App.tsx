import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Briefcase,
  ChartLine,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Code2,
  Compass,
  Download,
  Eye,
  FileText,
  GraduationCap,
  HardHat,
  HeartPulse,
  Info,
  Layers,
  LayoutDashboard,
  Leaf,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  X
} from 'lucide-react-native';
import { api } from './src/api';
import { colors, layout } from './src/theme';
import type {
  Catalog,
  Contest,
  ContestOptions,
  ContestPapers,
  Dashboard,
  DashboardFilters,
  EducationOptions,
  EstablishmentResults,
  FilterOptions,
  Job,
  JobCategory,
  JobSummary,
  OrientationQuestion,
  OrientationResults
} from './src/types';

type Tab = 'dashboard' | 'catalog' | 'orientation' | 'schools' | 'contests';
type ViewName = Tab | 'job' | 'contest';

const emptyDashboardFilters = (): DashboardFilters => ({ zones: [], sectors: [], companies: [], employmentTypes: [] });
const sectorColors = [colors.gold, colors.rust, '#89B6A8', '#6F9889', '#D5C08F', '#8C8D74'];
const formatter = new Intl.NumberFormat('fr-FR');

function CategoryIcon({ id, size = 22, color = colors.gold }: { id: string; size?: number; color?: string }) {
  const props = { size, color, strokeWidth: 1.8 };
  if (id === 'numerique') return <Code2 {...props} />;
  if (id === 'btp') return <HardHat {...props} />;
  if (id === 'sante') return <HeartPulse {...props} />;
  if (id === 'environnement') return <Leaf {...props} />;
  return <ChartLine {...props} />;
}

function Loading({ label }: { label: string }) {
  return <View style={styles.centered}><ActivityIndicator color={colors.gold} size="large" /><Text style={styles.loadingText}>{label}</Text></View>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <View style={styles.errorBox}><CircleHelp color={colors.danger} size={22} /><View style={styles.errorCopy}><Text style={styles.errorTitle}>Impossible de charger les données.</Text><Text style={styles.errorText}>{message}</Text></View><Pressable onPress={onRetry} style={styles.retryButton}><RefreshCw color={colors.cream} size={16} /></Pressable></View>;
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SectionTitle({ eyebrow, title, right }: { eyebrow: string; title: string; right?: React.ReactNode }) {
  return <View style={styles.sectionHeading}><View><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.sectionTitle}>{title}</Text></View>{right}</View>;
}

function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}><Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text></Pressable>;
}

function DashboardScreen({ onJob }: { onJob: (id: string) => void }) {
  const [data, setData] = useState<Dashboard | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(emptyDashboardFilters());
  const [draft, setDraft] = useState<DashboardFilters>(emptyDashboardFilters());
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await api.dashboard(filters, limit)); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur inconnue.'); }
    setLoading(false);
  }, [filters, limit]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.filterOptions().then(setFilterOptions).catch(() => undefined); }, []);

  const activeFilters = Object.values(filters).flat().length;
  const max = Math.max(...(data?.topJobs.map((job) => job.value) || [1]), 1);
  const toggle = (key: keyof DashboardFilters, value: string) => setDraft((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));

  if (loading && !data) return <Loading label="Mise à jour du marché de l'emploi…" />;
  if (error && !data) return <ErrorState message={error} onRetry={load} />;

  return <>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}><View><Text style={styles.eyebrow}>Marché de l'emploi · Congo</Text><Text style={styles.heroTitle}>Voir plus loin.{"\n"}<Text style={styles.heroAccent}>Choisir juste.</Text></Text><Text style={styles.heroCopy}>Explorez les signaux du marché pour éclairer votre parcours d'orientation.</Text></View><View style={styles.heroIcon}><Compass color={colors.gold} size={46} strokeWidth={1.4} /></View></View>
      <Card style={styles.toolbar}><View><Text style={styles.smallMuted}>Période analysée</Text><View style={styles.period}><Text style={styles.periodActive}>2026</Text><Text style={styles.periodMuted}>2025</Text></View></View><Pressable onPress={() => { setDraft(JSON.parse(JSON.stringify(filters))); setFilterOpen(true); }} style={styles.filterButton}><SlidersHorizontal color={colors.cream} size={18} /><Text style={styles.filterText}>Filtrer</Text>{activeFilters > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{activeFilters}</Text></View>}</Pressable></Card>
      {activeFilters > 0 && <Pressable onPress={() => setFilters(emptyDashboardFilters())} style={styles.activeFilterRow}><Text style={styles.activeFilterText}>{activeFilters} filtre{activeFilters > 1 ? 's' : ''} actif{activeFilters > 1 ? 's' : ''}</Text><Text style={styles.clearText}>Effacer</Text></Pressable>}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {data ? <>
        <View style={styles.metrics}><Metric label="Opportunités recensées" value={formatter.format(data.kpis.jobsCreated)} icon={<Briefcase color={colors.gold} size={19} />} /><Metric label="Évolution estimée" value={`+${data.kpis.variationPercent} %`} icon={<ArrowUp color={colors.positive} size={19} />} accent /></View>
        <View style={styles.insight}><View style={styles.insightIcon}><Sparkles color={colors.gold} size={18} /></View><Text style={styles.insightText}><Text style={styles.insightBold}>Le saviez-vous ? </Text>Les besoins évoluent selon la zone, le secteur et le contrat.</Text></View>
        <Card><SectionTitle eyebrow="Répartition" title="Par secteur d'activité" right={<Text style={styles.tag}>2026</Text>} /><View style={styles.legend}>{data.sectorDistribution.map((sector, index) => <View key={sector.name} style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: sectorColors[index % sectorColors.length] }]} /><Text style={styles.legendLabel}>{sector.name}</Text><Text style={styles.legendValue}>{sector.percent}%</Text></View>)}</View></Card>
        <Card><SectionTitle eyebrow="Métiers recherchés" title="Top opportunités" right={<View style={styles.topControls}>{[5, 8, 10].map((count) => <Pressable key={count} onPress={() => setLimit(count)} style={[styles.topControl, limit === count && styles.topControlActive]}><Text style={[styles.topControlText, limit === count && styles.topControlTextActive]}>{count}</Text></Pressable>)}</View>} />{data.topJobs.map((job, index) => <Pressable key={job.id} onPress={() => onJob(job.id)} style={styles.jobRow}><Text style={styles.rank}>0{index + 1}</Text><View style={styles.jobBarWrap}><Text style={styles.jobName}>{job.name}</Text><View style={styles.jobTrack}><View style={[styles.jobFill, { width: `${(job.value / max) * 100}%` }]} /></View></View><Text style={styles.jobValue}>{job.value}</Text><ChevronRight color={colors.gold} size={16} /></Pressable>)}</Card>
        <Card><SectionTitle eyebrow="Acteurs à suivre" title="Entreprises qui recrutent" right={<Text style={[styles.tag, styles.tagGold]}>Top 5</Text>} /><View style={styles.companyList}>{data.topCompanies.map((company, index) => <View style={styles.companyRow} key={company.name}><Text style={styles.rank}>0{index + 1}</Text><View style={styles.companyCopy}><Text style={styles.companyName}>{company.name}</Text><Text style={styles.companyCount}>{company.value} opportunités</Text></View><Briefcase color={colors.gold} size={16} /></View>)}</View></Card>
        <View style={styles.dataNote}><Info color={colors.gold} size={14} /><Text style={styles.dataNoteText}>Données de démonstration · mise à jour {data.metadata.lastUpdated}</Text></View>
      </> : null}
    </ScrollView>
    <Modal visible={filterOpen} animationType="slide" transparent onRequestClose={() => setFilterOpen(false)}><View style={styles.modalOverlay}><Pressable style={StyleSheet.absoluteFill} onPress={() => setFilterOpen(false)} /><View style={styles.sheet}><View style={styles.sheetHeader}><View><Text style={styles.eyebrow}>Affiner les résultats</Text><Text style={styles.sheetTitle}>Filtres</Text></View><Pressable onPress={() => setFilterOpen(false)} style={styles.iconButton}><X color={colors.cream} size={20} /></Pressable></View><ScrollView style={styles.sheetBody}>{filterOptions ? ([['zones', 'Zone géographique', filterOptions.zones], ['sectors', "Secteur d'activité", filterOptions.sectors], ['companies', 'Entreprise', filterOptions.companies], ['employmentTypes', "Type d'emploi", filterOptions.employmentTypes]] as const).map(([key, label, values]) => <View key={key} style={styles.filterGroup}><Text style={styles.filterGroupTitle}>{label}</Text><View style={styles.chips}>{values.map((value) => <Pill key={value} label={value} active={draft[key].includes(value)} onPress={() => toggle(key, value)} />)}</View></View>) : <Loading label="Chargement des filtres…" />}</ScrollView><View style={styles.sheetActions}><Pressable onPress={() => setDraft(emptyDashboardFilters())} style={styles.textButton}><Text style={styles.textButtonLabel}>Réinitialiser</Text></Pressable><Pressable onPress={() => { setFilters(draft); setFilterOpen(false); }} style={styles.primaryButton}><Text style={styles.primaryText}>Appliquer</Text><ArrowRight color={colors.ink} size={17} /></Pressable></View></View></View></Modal>
  </>;
}

function Metric({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: boolean }) {
  return <Card style={[styles.metric, accent && styles.metricAccent]}><View style={styles.metricHead}><Text style={styles.smallMuted}>{label}</Text>{icon}</View><Text style={styles.metricValue}>{value}</Text><Text style={[styles.metricDetail, accent && styles.metricPositive]}>{accent ? 'par rapport à la période précédente' : 'sur la période sélectionnée'}</Text></Card>;
}

function CatalogScreen({ onJob }: { onJob: (id: string) => void }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const result = await api.catalog(); setCatalog(result); setOpen(result.categories[0]?.id || null); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur inconnue.'); } setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <Loading label="Chargement des métiers…" />;
  if (error || !catalog) return <ErrorState message={error} onRetry={load} />;
  const matches = catalog.items.filter((job) => `${job.name} ${job.description} ${job.sector}`.toLowerCase().includes(search.toLowerCase()));
  return <ScrollView contentContainerStyle={styles.scrollContent}><View style={styles.hero}><View><Text style={styles.eyebrow}>Explorer son avenir</Text><Text style={styles.heroTitle}>Des métiers à{`\n`}<Text style={styles.heroAccent}>votre mesure.</Text></Text><Text style={styles.heroCopy}>Découvrez les univers professionnels et les parcours associés.</Text></View><View style={styles.heroIcon}><Layers color={colors.gold} size={42} /></View></View><View style={styles.searchBox}><Search color={colors.muted} size={18} /><TextInput value={search} onChangeText={setSearch} placeholder="Rechercher un métier…" placeholderTextColor={colors.mutedDeep} style={styles.searchInput} />{search ? <Pressable onPress={() => setSearch('')}><X color={colors.muted} size={18} /></Pressable> : null}</View><View style={styles.resultLine}><Text style={styles.resultAccent}>Catalogue de démonstration</Text><Text style={styles.smallMuted}>{matches.length} métier{matches.length !== 1 ? 's' : ''}</Text></View>{search ? <JobCards jobs={matches} onJob={onJob} /> : catalog.categories.map((category) => <CategoryAccordion key={category.id} category={category} jobs={catalog.items.filter((job) => job.categoryId === category.id)} open={open === category.id} onToggle={() => setOpen(open === category.id ? null : category.id)} onJob={onJob} />)}<View style={styles.dataNote}><Info color={colors.gold} size={14} /><Text style={styles.dataNoteText}>Référentiel de démonstration à faire valider.</Text></View></ScrollView>;
}

function CategoryAccordion({ category, jobs, open, onToggle, onJob }: { category: JobCategory; jobs: JobSummary[]; open: boolean; onToggle: () => void; onJob: (id: string) => void }) {
  return <Card style={styles.accordion}><Pressable onPress={onToggle} style={styles.accordionHead}><View style={styles.categoryIcon}><CategoryIcon id={category.id} /></View><View style={styles.accordionCopy}><Text style={styles.accordionTitle}>{category.name}</Text><Text style={styles.accordionDescription}>{category.description}</Text></View><View style={styles.countBadge}><Text style={styles.countText}>{category.jobCount}</Text></View><ChevronRight color={colors.gold} size={19} style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }} /></Pressable>{open ? <JobCards jobs={jobs} onJob={onJob} /> : null}</Card>;
}

function JobCards({ jobs, onJob }: { jobs: JobSummary[]; onJob: (id: string) => void }) {
  if (!jobs.length) return <Card style={styles.emptyCard}><Search color={colors.gold} size={25} /><Text style={styles.emptyTitle}>Aucun métier trouvé</Text><Text style={styles.emptyText}>Essayez un autre mot-clé.</Text></Card>;
  return <View style={styles.jobCards}>{jobs.map((job) => <Pressable key={job.id} onPress={() => onJob(job.id)} style={styles.jobCard}><View style={styles.jobCardIcon}><CategoryIcon id={job.categoryId} size={17} /></View><View style={styles.jobCardCopy}><Text style={styles.jobSector}>{job.sector}</Text><Text style={styles.jobCardTitle}>{job.name}</Text><Text style={styles.jobDescription} numberOfLines={2}>{job.description}</Text></View><ChevronRight color={colors.gold} size={18} /></Pressable>)}</View>;
}

function JobScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const [job, setJob] = useState<Job | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { setJob(await api.job(id)); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur inconnue.'); } setLoading(false); }, [id]);
  useEffect(() => { load(); }, [load]);
  if (loading) return <Loading label="Chargement de la fiche métier…" />;
  if (error || !job) return <ErrorState message={error} onRetry={load} />;
  return <ScrollView contentContainerStyle={styles.scrollContent}><Back onPress={onBack} label="Retour au catalogue" /><Card style={styles.jobHero}><View style={styles.jobHeroTop}><View style={styles.jobHeroIcon}><CategoryIcon id={job.categoryId} size={40} /></View><View style={styles.flex}><Text style={styles.eyebrow}>{job.category} · {job.sector}</Text><Text style={styles.jobTitle}>{job.name}</Text><Text style={styles.heroCopy}>{job.description}</Text></View></View><View style={styles.profileBox}><Target color={colors.gold} size={18} /><Text style={styles.profileLabel}>Pour vous si vous…</Text><Text style={styles.profileText}>{job.profile}</Text></View></Card><Card><SectionTitle eyebrow="Le rôle" title="Ce que fait ce métier" /><Text style={styles.bodyText}>{job.mission}</Text></Card><Card><SectionTitle eyebrow="Compétences clés" title="Ce qu'il faut développer" /><View style={styles.chips}>{job.skills.map((skill) => <Pill key={skill} label={skill} />)}</View></Card><Card><SectionTitle eyebrow="Parcours possibles" title="Formations associées" right={<Text style={[styles.tag, styles.tagGold]}>À vérifier</Text>} />{job.trainings.map((training) => <View key={training.name} style={styles.training}><View style={styles.trainingIcon}><GraduationCap color={colors.gold} size={18} /></View><View style={styles.flex}><Text style={styles.trainingTitle}>{training.name}</Text><Text style={styles.trainingFormat}>{training.format}</Text></View><Text style={styles.level}>{training.level}</Text></View>)}</Card><Card><SectionTitle eyebrow="Écosystème" title="Organisations associées" /><View style={styles.chips}>{job.companies.map((company) => <View style={styles.companyPill} key={company}><Briefcase color={colors.gold} size={13} /><Text style={styles.companyPillText}>{company}</Text></View>)}</View></Card></ScrollView>;
}

function OrientationScreen({ onJob }: { onJob: (id: string) => void }) {
  const [sessionId, setSessionId] = useState(''); const [question, setQuestion] = useState<OrientationQuestion | null>(null); const [history, setHistory] = useState<Array<{ question: string; answer: string }>>([]); const [results, setResults] = useState<OrientationResults | null>(null); const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState('');
  const start = useCallback(async () => { setLoading(true); setError(''); setHistory([]); setResults(null); try { const session = await api.startOrientation(); setSessionId(session.sessionId); setQuestion(session.question); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur inconnue.'); } setLoading(false); }, []);
  useEffect(() => { start(); }, [start]);
  const answer = async (value: string) => { if (!question || submitting) return; const selected = question.options.find((option) => option.value === value); if (!selected) return; setSubmitting(true); setError(''); try { const response = await api.answerOrientation(sessionId, question.id, value); setHistory((items) => [...items, { question: question.prompt, answer: selected.label }]); if (response.completed) { setQuestion(null); setResults(await api.orientationResults(sessionId)); } else setQuestion(response.question); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur inconnue.'); } setSubmitting(false); };
  if (loading) return <Loading label="Préparation de votre orientation…" />;
  if (error && !question && !results) return <ErrorState message={error} onRetry={start} />;
  if (results) return <OrientationResultScreen results={results} history={history} onRestart={start} onJob={onJob} />;
  if (!question) return <Loading label="Analyse de vos réponses…" />;
  return <ScrollView contentContainerStyle={styles.scrollContent}><View style={styles.hero}><View><Text style={styles.eyebrow}>Orientation guidée</Text><Text style={styles.heroTitle}>Commençons par{`\n`}<Text style={styles.heroAccent}>vous écouter.</Text></Text><Text style={styles.heroCopy}>Chaque question dépend de vos réponses précédentes.</Text></View><View style={styles.heroIcon}><Compass color={colors.gold} size={42} /></View></View><Card style={styles.questionCard}><View style={styles.questionHead}><View><Text style={styles.eyebrow}>{question.eyebrow}</Text><Text style={styles.smallMuted}>Question {question.step} / {question.total}</Text></View><Pressable onPress={start}><RefreshCw color={colors.muted} size={17} /></Pressable></View><View style={styles.progress}><View style={[styles.progressFill, { width: `${((question.step - 1) / question.total) * 100}%` }]} /></View><View style={styles.questionBody}><Text style={styles.questionTitle}>{question.prompt}</Text><Text style={styles.questionHelp}>{question.helper}</Text><View style={styles.answerList}>{question.options.map((option, index) => <Pressable disabled={submitting} onPress={() => answer(option.value)} style={styles.answerCard} key={option.value}><Text style={styles.answerIndex}>0{index + 1}</Text><View style={styles.flex}><Text style={styles.answerTitle}>{option.label}</Text><Text style={styles.answerDescription}>{option.description}</Text></View><ChevronRight color={colors.gold} size={18} /></Pressable>)}</View></View>{error ? <View style={styles.inlineError}><Info color={colors.danger} size={16} /><Text style={styles.errorText}>{error}</Text></View> : null}</Card><AnswerHistory history={history} /><View style={styles.dataNote}><Info color={colors.gold} size={14} /><Text style={styles.dataNoteText}>Aucun nom ni résultat scolaire n’est demandé.</Text></View></ScrollView>;
}

function AnswerHistory({ history }: { history: Array<{ question: string; answer: string }> }) {
  if (!history.length) return null;
  return <Card><Text style={styles.eyebrow}>Vos réponses</Text>{history.map((item) => <View key={item.question} style={styles.historyItem}><Text style={styles.historyQuestion} numberOfLines={1}>{item.question}</Text><Text style={styles.historyAnswer}>{item.answer}</Text></View>)}</Card>;
}

function OrientationResultScreen({ results, history, onRestart, onJob }: { results: OrientationResults; history: Array<{ question: string; answer: string }>; onRestart: () => void; onJob: (id: string) => void }) {
  return <ScrollView contentContainerStyle={styles.scrollContent}><View style={styles.resultHero}><View style={styles.resultCircle}><CircleCheck color={colors.positive} size={22} /></View><Text style={styles.eyebrow}>Parcours complété</Text><Text style={styles.heroTitle}>Vos premières{`\n`}<Text style={styles.heroAccent}>pistes.</Text></Text><Text style={styles.heroCopy}>Des recommandations transparentes basées sur vos réponses.</Text><Pressable onPress={onRestart} style={styles.outlineButton}><RefreshCw color={colors.cream} size={16} /><Text style={styles.outlineText}>Refaire le parcours</Text></Pressable></View><Card><SectionTitle eyebrow="Votre profil résumé" title="5 critères pris en compte" />{results.profile.map((item) => <View style={styles.profileResult} key={item.label}><Text style={styles.historyQuestion}>{item.label}</Text><Text style={styles.historyAnswer}>{item.value}</Text></View>)}</Card><SectionTitle eyebrow="Pistes prioritaires" title="Métiers à explorer" />{results.recommendations.map((item) => <Card key={item.jobId} style={styles.recommendation}><View style={styles.recommendationHead}><View style={styles.rankCircle}><Text style={styles.rankCircleText}>0{item.rank}</Text></View><View style={styles.flex}><Text style={styles.jobSector}>{item.category}</Text><Text style={styles.recommendationTitle}>{item.job}</Text></View><View style={styles.score}><Text style={styles.scoreValue}>{item.score}%</Text><Text style={styles.scoreLabel}>indice</Text></View></View><Text style={styles.recommendationReason}>{item.reason}</Text>{item.pathway ? <View style={styles.pathway}><GraduationCap color={colors.gold} size={18} /><View style={styles.flex}><Text style={styles.pathwayLabel}>Parcours à explorer</Text><Text style={styles.pathwayTitle}>{item.pathway.program} · {item.pathway.establishment}</Text><Text style={styles.trainingFormat}>{item.pathway.city} · {item.pathway.duration}</Text></View></View> : null}<Pressable onPress={() => onJob(item.jobId)} style={styles.outlineButton}><Text style={styles.outlineText}>Voir le métier</Text><ChevronRight color={colors.cream} size={16} /></Pressable></Card>)}<Card style={styles.noticeCard}><Info color={colors.gold} size={18} /><Text style={styles.noticeText}>L’indice est une compatibilité indicative, pas une admission ni une garantie d’emploi.</Text></Card><AnswerHistory history={history} /></ScrollView>;
}

function SchoolsScreen() {
  const [options, setOptions] = useState<EducationOptions | null>(null); const [results, setResults] = useState<EstablishmentResults | null>(null); const [filters, setFilters] = useState({ series: '', field: '', job: '' }); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const [nextOptions, nextResults] = await Promise.all([api.educationOptions(), api.establishments(filters)]); setOptions(nextOptions); setResults(nextResults); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur inconnue.'); } setLoading(false); }, [filters]);
  useEffect(() => { load(); }, [load]);
  if (loading && !results) return <Loading label="Recherche des formations…" />;
  if (error && !results) return <ErrorState message={error} onRetry={load} />;
  return <ScrollView contentContainerStyle={styles.scrollContent}><View style={styles.hero}><View><Text style={styles.eyebrow}>Parcours de formation</Text><Text style={styles.heroTitle}>Trouver le bon{`\n`}<Text style={styles.heroAccent}>point de départ.</Text></Text><Text style={styles.heroCopy}>Recherchez une formation par série, filière ou métier visé.</Text></View><View style={styles.heroIcon}><GraduationCap color={colors.gold} size={42} /></View></View><Card><SectionTitle eyebrow="Affiner la recherche" title="Établissements" right={<Pressable onPress={() => setFilters({ series: '', field: '', job: '' })}><Text style={styles.clearText}>Réinitialiser</Text></Pressable>} /><FilterStrip label="Série" values={options?.series || []} selected={filters.series} onSelect={(series) => setFilters((value) => ({ ...value, series }))} /><FilterStrip label="Filière" values={options?.fields || []} selected={filters.field} onSelect={(field) => setFilters((value) => ({ ...value, field }))} /><FilterStrip label="Métier" values={options?.jobs || []} selected={filters.job} onSelect={(job) => setFilters((value) => ({ ...value, job }))} /></Card>{loading ? <Loading label="Mise à jour des parcours…" /> : null}{error ? <ErrorState message={error} onRetry={load} /> : null}{results?.items.map((item) => <Card key={item.id} style={styles.schoolCard}><View style={styles.schoolHead}><View style={styles.schoolBadge}><GraduationCap color={colors.gold} size={19} /></View><View style={styles.flex}><Text style={styles.jobSector}>{item.field}</Text><Text style={styles.schoolName}>{item.establishment}</Text><Text style={styles.trainingTitle}>{item.program}</Text></View><MapPin color={colors.muted} size={17} /></View><Text style={styles.trainingFormat}>{item.city} · {item.duration} · {item.series.join(' · ')}</Text><View style={styles.chips}>{item.jobs.map((job) => <Pill key={job} label={job} />)}</View></Card>)}</ScrollView>;
}

function FilterStrip({ label, values, selected, onSelect }: { label: string; values: string[]; selected: string; onSelect: (value: string) => void }) {
  return <View style={styles.filterStrip}><Text style={styles.filterStripLabel}>{label}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}><Pill label="Tous" active={!selected} onPress={() => onSelect('')} />{values.map((value) => <Pill key={value} label={value} active={selected === value} onPress={() => onSelect(value)} />)}</ScrollView></View>;
}

function ContestsScreen({ onContest }: { onContest: (id: string) => void }) {
  const [options, setOptions] = useState<ContestOptions | null>(null); const [results, setResults] = useState<Contest[] | null>(null); const [filters, setFilters] = useState({ series: '', field: '' }); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const [nextOptions, nextResults] = await Promise.all([api.contestOptions(), api.contests(filters)]); setOptions(nextOptions); setResults(nextResults.items); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur inconnue.'); } setLoading(false); }, [filters]);
  useEffect(() => { load(); }, [load]);
  if (loading && !results) return <Loading label="Recherche des concours…" />;
  if (error && !results) return <ErrorState message={error} onRetry={load} />;
  return <ScrollView contentContainerStyle={styles.scrollContent}><View style={styles.hero}><View><Text style={styles.eyebrow}>Préparer sa candidature</Text><Text style={styles.heroTitle}>Les concours,{`\n`}<Text style={styles.heroAccent}>sans détour.</Text></Text><Text style={styles.heroCopy}>Filtrez les concours et retrouvez les références d’annales.</Text></View><View style={styles.heroIcon}><FileText color={colors.gold} size={42} /></View></View><Card><SectionTitle eyebrow="Votre recherche" title="Concours et annales" right={<Pressable onPress={() => setFilters({ series: '', field: '' })}><Text style={styles.clearText}>Réinitialiser</Text></Pressable>} /><FilterStrip label="Série" values={options?.series || []} selected={filters.series} onSelect={(series) => setFilters((value) => ({ ...value, series }))} /><FilterStrip label="Filière" values={options?.fields || []} selected={filters.field} onSelect={(field) => setFilters((value) => ({ ...value, field }))} /></Card>{loading ? <Loading label="Mise à jour des concours…" /> : null}{error ? <ErrorState message={error} onRetry={load} /> : null}{results?.map((contest) => <Pressable key={contest.id} onPress={() => onContest(contest.id)}><Card style={styles.contestCard}><View style={styles.yearBadge}><Text style={styles.yearText}>2026</Text></View><View style={styles.flex}><Text style={styles.jobSector}>{contest.field} · {contest.city}</Text><Text style={styles.contestName}>{contest.name}</Text><Text style={styles.trainingFormat}>{contest.organizer}</Text><Text style={styles.contestDescription} numberOfLines={2}>{contest.description}</Text></View><ChevronRight color={colors.gold} size={19} /></Card></Pressable>)}</ScrollView>;
}

function ContestScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<ContestPapers | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { setData(await api.contest(id)); } catch (err) { setError(err instanceof Error ? err.message : 'Erreur inconnue.'); } setLoading(false); }, [id]);
  useEffect(() => { load(); }, [load]);
  if (loading) return <Loading label="Chargement des annales…" />;
  if (error || !data) return <ErrorState message={error} onRetry={load} />;
  return <ScrollView contentContainerStyle={styles.scrollContent}><Back onPress={onBack} label="Retour aux concours" /><Card style={styles.contestDetail}><View style={styles.jobHeroTop}><View style={styles.jobHeroIcon}><FileText color={colors.gold} size={34} /></View><View style={styles.flex}><Text style={styles.eyebrow}>{data.contest.field} · {data.contest.city}</Text><Text style={styles.contestName}>{data.contest.name}</Text><Text style={styles.heroCopy}>{data.contest.organizer}</Text></View></View></Card><Card style={styles.noticeCard}><Info color={colors.gold} size={18} /><Text style={styles.noticeText}>Les aperçus et téléchargements seront activés après vérification des droits de diffusion.</Text></Card><Card><SectionTitle eyebrow="Épreuves disponibles" title={`${data.papers.length} références`} />{data.papers.map((paper) => <View style={styles.paper} key={paper.id}><View style={styles.paperIcon}><FileText color={colors.gold} size={20} /></View><View style={styles.flex}><Text style={styles.trainingTitle}>{paper.label}</Text><Text style={styles.trainingFormat}>{paper.year} · {paper.type} · {paper.pages} pages</Text></View><View style={styles.paperActions}><Pressable onPress={() => Alert.alert('Aperçu bientôt disponible', 'Le document source doit encore être autorisé.')}><Eye color={colors.muted} size={19} /></Pressable><Pressable onPress={() => Alert.alert('Téléchargement indisponible', 'Le document source n’est pas encore publié.')}><Download color={colors.gold} size={19} /></Pressable></View></View>)}</Card></ScrollView>;
}

function Back({ onPress, label }: { onPress: () => void; label: string }) { return <Pressable onPress={onPress} style={styles.back}><ArrowLeft color={colors.gold} size={18} /><Text style={styles.backText}>{label}</Text></Pressable>; }

export default function App() {
  const [view, setView] = useState<ViewName>('dashboard'); const [selectedJob, setSelectedJob] = useState(''); const [selectedContest, setSelectedContest] = useState('');
  const openJob = (id: string) => { setSelectedJob(id); setView('job'); };
  const openContest = (id: string) => { setSelectedContest(id); setView('contest'); };
  const renderView = () => {
    if (view === 'job') return <JobScreen id={selectedJob} onBack={() => setView('catalog')} />;
    if (view === 'contest') return <ContestScreen id={selectedContest} onBack={() => setView('contests')} />;
    if (view === 'catalog') return <CatalogScreen onJob={openJob} />;
    if (view === 'orientation') return <OrientationScreen onJob={openJob} />;
    if (view === 'schools') return <SchoolsScreen />;
    if (view === 'contests') return <ContestsScreen onContest={openContest} />;
    return <DashboardScreen onJob={openJob} />;
  };
  return <SafeAreaView style={styles.safe}><StatusBar style="light" /><View style={styles.app}>{renderView()}{(['dashboard', 'catalog', 'orientation', 'schools', 'contests'] as Tab[]).includes(view as Tab) ? <View style={styles.tabBar}><TabButton label="Marché" active={view === 'dashboard'} onPress={() => setView('dashboard')} icon={<LayoutDashboard color={view === 'dashboard' ? colors.gold : colors.mutedDeep} size={20} />} /><TabButton label="Métiers" active={view === 'catalog'} onPress={() => setView('catalog')} icon={<Layers color={view === 'catalog' ? colors.gold : colors.mutedDeep} size={20} />} /><TabButton label="Orienter" active={view === 'orientation'} onPress={() => setView('orientation')} icon={<Compass color={view === 'orientation' ? colors.gold : colors.mutedDeep} size={20} />} /><TabButton label="Écoles" active={view === 'schools'} onPress={() => setView('schools')} icon={<GraduationCap color={view === 'schools' ? colors.gold : colors.mutedDeep} size={20} />} /><TabButton label="Annales" active={view === 'contests'} onPress={() => setView('contests')} icon={<FileText color={view === 'contests' ? colors.gold : colors.mutedDeep} size={20} />} /></View> : null}</View></SafeAreaView>;
}

function TabButton({ label, active, icon, onPress }: { label: string; active: boolean; icon: React.ReactNode; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.tabButton}>{icon}<Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ink }, app: { flex: 1, backgroundColor: colors.ink }, scrollContent: { padding: layout.page, paddingBottom: 98, gap: 13 }, flex: { flex: 1 }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 13, padding: 24, backgroundColor: colors.ink }, loadingText: { color: colors.muted, fontSize: 14 }, card: { backgroundColor: colors.surface, borderRadius: layout.radius, borderWidth: 1, borderColor: colors.border, padding: 16 }, hero: { minHeight: 178, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 24 }, eyebrow: { color: colors.gold, fontSize: 10, letterSpacing: 1.3, fontWeight: '700', textTransform: 'uppercase', marginBottom: 7 }, heroTitle: { color: colors.cream, fontSize: 36, lineHeight: 37, fontFamily: 'Georgia', fontWeight: '700', letterSpacing: -1.4 }, heroAccent: { color: colors.gold }, heroCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 12, maxWidth: 270 }, heroIcon: { width: 82, height: 82, borderRadius: 41, borderWidth: 1, borderColor: colors.borderStrong, justifyContent: 'center', alignItems: 'center', marginTop: 14, backgroundColor: colors.surface }, toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, smallMuted: { color: colors.muted, fontSize: 11 }, period: { flexDirection: 'row', gap: 9, marginTop: 7 }, periodActive: { color: colors.ink, backgroundColor: '#E4D6AD', paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '700', borderRadius: 5 }, periodMuted: { color: colors.mutedDeep, paddingHorizontal: 6, paddingVertical: 5, fontSize: 11 }, filterButton: { backgroundColor: '#20473C', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 7 }, filterText: { color: colors.cream, fontSize: 12, fontWeight: '700' }, badge: { backgroundColor: colors.gold, width: 19, height: 19, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }, badgeText: { color: colors.ink, fontSize: 10, fontWeight: '800' }, activeFilterRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }, activeFilterText: { color: colors.muted, fontSize: 11 }, clearText: { color: colors.gold, fontSize: 11, textDecorationLine: 'underline' }, metrics: { flexDirection: 'row', gap: 10 }, metric: { flex: 1, minHeight: 137, padding: 13 }, metricAccent: { borderColor: '#5C5235' }, metricHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 }, metricValue: { color: colors.cream, fontFamily: 'Georgia', fontSize: 27, fontWeight: '700', marginTop: 18 }, metricDetail: { color: colors.mutedDeep, fontSize: 9, lineHeight: 13, marginTop: 6 }, metricPositive: { color: colors.positive }, insight: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#3B513D', backgroundColor: '#18382F' }, insightIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2B4637' }, insightText: { flex: 1, color: colors.muted, fontSize: 11, lineHeight: 16 }, insightBold: { color: '#F0DEAE', fontWeight: '700' }, sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }, sectionTitle: { color: colors.cream, fontFamily: 'Georgia', fontSize: 19, fontWeight: '700' }, tag: { borderWidth: 1, borderColor: colors.borderStrong, color: colors.muted, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, fontSize: 10 }, tagGold: { color: '#DFB36D', borderColor: '#6F5A35' }, legend: { gap: 10 }, legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, legendDot: { width: 8, height: 8, borderRadius: 3 }, legendLabel: { flex: 1, color: colors.muted, fontSize: 12 }, legendValue: { color: colors.cream, fontSize: 11, fontWeight: '700' }, topControls: { flexDirection: 'row', gap: 4 }, topControl: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 }, topControlActive: { backgroundColor: colors.gold, borderColor: colors.gold }, topControlText: { color: colors.muted, fontSize: 10 }, topControlTextActive: { color: colors.ink, fontWeight: '700' }, jobRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingVertical: 9 }, rank: { color: colors.mutedDeep, fontSize: 10, width: 20 }, jobBarWrap: { flex: 1 }, jobName: { color: colors.muted, fontSize: 11, marginBottom: 6 }, jobTrack: { height: 6, backgroundColor: '#25483D', borderRadius: 4, overflow: 'hidden' }, jobFill: { height: '100%', backgroundColor: colors.rust, borderRadius: 4 }, jobValue: { color: colors.cream, fontSize: 10, width: 30, textAlign: 'right' }, companyList: { gap: 7 }, companyRow: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 }, companyCopy: { flex: 1 }, companyName: { color: colors.cream, fontSize: 12, fontWeight: '700' }, companyCount: { color: colors.mutedDeep, fontSize: 10, marginTop: 3 }, dataNote: { flexDirection: 'row', alignItems: 'center', gap: 5 }, dataNoteText: { flex: 1, color: colors.mutedDeep, fontSize: 10, lineHeight: 15 }, modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(4,14,11,.68)' }, sheet: { maxHeight: '85%', backgroundColor: '#102720', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: colors.borderStrong }, sheetHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: colors.border }, sheetTitle: { color: colors.cream, fontFamily: 'Georgia', fontSize: 28, fontWeight: '700' }, iconButton: { borderWidth: 1, borderColor: colors.borderStrong, padding: 8, borderRadius: 8 }, sheetBody: { paddingHorizontal: 20 }, sheetActions: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: colors.border }, textButton: { padding: 9 }, textButtonLabel: { color: colors.muted, fontSize: 12 }, primaryButton: { backgroundColor: '#E1BA72', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 8, flexDirection: 'row', gap: 7, alignItems: 'center' }, primaryText: { color: colors.ink, fontWeight: '800', fontSize: 12 }, filterGroup: { paddingVertical: 18, borderBottomWidth: 1, borderColor: colors.border }, filterGroupTitle: { color: colors.cream, fontWeight: '700', marginBottom: 11, fontSize: 13 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, pill: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: '#16362D' }, pillActive: { backgroundColor: '#D8AD62', borderColor: '#D8AD62' }, pillText: { color: colors.muted, fontSize: 10 }, pillTextActive: { color: colors.ink, fontWeight: '700' }, errorBox: { flexDirection: 'row', margin: layout.page, gap: 10, borderRadius: 10, borderWidth: 1, borderColor: '#89504A', backgroundColor: '#4A2828', padding: 13, alignItems: 'flex-start' }, errorCopy: { flex: 1 }, errorTitle: { color: colors.danger, fontSize: 12, fontWeight: '700' }, errorText: { color: '#D9AAA3', fontSize: 10, lineHeight: 14, marginTop: 4 }, retryButton: { padding: 6 }, searchBox: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 11, backgroundColor: '#14342B', paddingHorizontal: 14, height: 53, flexDirection: 'row', alignItems: 'center', gap: 9 }, searchInput: { flex: 1, color: colors.cream, fontSize: 13 }, resultLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }, resultAccent: { color: colors.gold, fontSize: 10 }, accordion: { padding: 0, overflow: 'hidden' }, accordionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13 }, categoryIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#244A3E', justifyContent: 'center', alignItems: 'center' }, accordionCopy: { flex: 1 }, accordionTitle: { color: colors.cream, fontFamily: 'Georgia', fontSize: 16, fontWeight: '700' }, accordionDescription: { color: colors.mutedDeep, fontSize: 10, marginTop: 3 }, countBadge: { backgroundColor: '#20463A', padding: 5, borderRadius: 5 }, countText: { color: colors.muted, fontSize: 10 }, jobCards: { paddingHorizontal: 10, paddingBottom: 10, gap: 8 }, jobCard: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', borderWidth: 1, borderColor: colors.border, backgroundColor: '#17362E', borderRadius: 9, padding: 11 }, jobCardIcon: { width: 29, height: 29, borderRadius: 7, backgroundColor: '#2A5042', alignItems: 'center', justifyContent: 'center' }, jobCardCopy: { flex: 1 }, jobSector: { color: colors.gold, fontSize: 9, textTransform: 'uppercase', letterSpacing: .7, fontWeight: '700' }, jobCardTitle: { color: colors.cream, fontSize: 12, fontWeight: '700', marginTop: 4 }, jobDescription: { color: colors.muted, fontSize: 10, lineHeight: 14, marginTop: 4 }, emptyCard: { alignItems: 'center', gap: 7 }, emptyTitle: { color: colors.cream, fontWeight: '700' }, emptyText: { color: colors.muted, fontSize: 11 }, back: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingVertical: 5 }, backText: { color: colors.gold, fontSize: 12, fontWeight: '700' }, jobHero: { gap: 17 }, jobHeroTop: { flexDirection: 'row', gap: 12 }, jobHeroIcon: { width: 62, height: 62, borderRadius: 14, backgroundColor: '#244A3D', borderWidth: 1, borderColor: '#685531', justifyContent: 'center', alignItems: 'center' }, jobTitle: { color: colors.cream, fontFamily: 'Georgia', fontSize: 27, lineHeight: 30, fontWeight: '700' }, profileBox: { borderWidth: 1, borderColor: colors.borderStrong, padding: 12, borderRadius: 9, gap: 5, backgroundColor: '#102820' }, profileLabel: { color: colors.gold, textTransform: 'uppercase', fontSize: 9, letterSpacing: .6, fontWeight: '700' }, profileText: { color: colors.cream, fontSize: 11, lineHeight: 16 }, bodyText: { color: colors.muted, fontSize: 13, lineHeight: 20 }, training: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 9, borderBottomWidth: 1, borderColor: colors.border }, trainingIcon: { backgroundColor: '#294E42', padding: 8, borderRadius: 7 }, trainingTitle: { color: colors.cream, fontSize: 12, fontWeight: '700' }, trainingFormat: { color: colors.muted, fontSize: 10, marginTop: 3 }, level: { color: '#D6BA83', backgroundColor: '#314537', borderRadius: 5, padding: 5, fontSize: 9 }, companyPill: { flexDirection: 'row', gap: 5, alignItems: 'center', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 6, padding: 7 }, companyPillText: { color: colors.muted, fontSize: 10 }, questionCard: { padding: 0, overflow: 'hidden' }, questionHead: { padding: 16, flexDirection: 'row', justifyContent: 'space-between' }, progress: { height: 3, backgroundColor: '#294C40' }, progressFill: { height: '100%', backgroundColor: colors.gold }, questionBody: { padding: 16 }, questionTitle: { color: colors.cream, fontFamily: 'Georgia', fontSize: 25, lineHeight: 30, fontWeight: '700' }, questionHelp: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 9 }, answerList: { marginTop: 16, gap: 9 }, answerCard: { minHeight: 75, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: '#17382F', borderRadius: 10, padding: 11 }, answerIndex: { color: colors.gold, backgroundColor: '#294E41', padding: 7, borderRadius: 6, fontSize: 10, fontWeight: '700' }, answerTitle: { color: colors.cream, fontSize: 12, fontWeight: '700' }, answerDescription: { color: colors.muted, fontSize: 10, lineHeight: 14, marginTop: 4 }, inlineError: { flexDirection: 'row', gap: 6, padding: 12, alignItems: 'center' }, historyItem: { borderWidth: 1, borderColor: colors.border, borderRadius: 7, padding: 9, marginTop: 7 }, historyQuestion: { color: colors.mutedDeep, fontSize: 9 }, historyAnswer: { color: colors.cream, fontSize: 11, marginTop: 3, fontWeight: '700' }, resultHero: { gap: 8, paddingTop: 25 }, resultCircle: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#295442', alignItems: 'center', justifyContent: 'center' }, outlineButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 7, marginTop: 8 }, outlineText: { color: colors.cream, fontSize: 10, fontWeight: '700' }, profileResult: { borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 8 }, recommendation: { gap: 10 }, recommendationHead: { flexDirection: 'row', gap: 10, alignItems: 'center' }, rankCircle: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#274B3E' }, rankCircleText: { color: colors.gold, fontFamily: 'Georgia', fontWeight: '700' }, recommendationTitle: { color: colors.cream, fontFamily: 'Georgia', fontSize: 20, fontWeight: '700', marginTop: 3 }, score: { alignItems: 'flex-end' }, scoreValue: { color: '#E5BF78', fontFamily: 'Georgia', fontSize: 25, fontWeight: '700' }, scoreLabel: { color: colors.mutedDeep, fontSize: 8 }, recommendationReason: { color: colors.muted, fontSize: 11, lineHeight: 16 }, pathway: { flexDirection: 'row', gap: 8, backgroundColor: '#193D33', padding: 9, borderRadius: 7, borderWidth: 1, borderColor: colors.borderStrong }, pathwayLabel: { color: colors.muted, fontSize: 9 }, pathwayTitle: { color: colors.cream, fontSize: 10, fontWeight: '700', marginTop: 3 }, noticeCard: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', borderColor: '#695B3B', backgroundColor: '#2A3327' }, noticeText: { flex: 1, color: '#CBC6B2', fontSize: 10, lineHeight: 15 }, filterStrip: { marginTop: 12 }, filterStripLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', marginBottom: 7 }, schoolCard: { gap: 9 }, schoolHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 }, schoolBadge: { width: 37, height: 37, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#254A3E' }, schoolName: { color: colors.cream, fontFamily: 'Georgia', fontSize: 16, fontWeight: '700', marginTop: 2 }, contestCard: { flexDirection: 'row', gap: 10, alignItems: 'center' }, yearBadge: { width: 38, height: 38, borderRadius: 9, backgroundColor: '#284B3E', justifyContent: 'center', alignItems: 'center' }, yearText: { color: colors.gold, fontFamily: 'Georgia', fontSize: 11, fontWeight: '700' }, contestName: { color: colors.cream, fontFamily: 'Georgia', fontSize: 17, lineHeight: 21, fontWeight: '700', marginTop: 3 }, contestDescription: { color: colors.mutedDeep, fontSize: 10, lineHeight: 14, marginTop: 5 }, contestDetail: { gap: 6 }, paper: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border }, paperIcon: { padding: 8, backgroundColor: '#244538', borderRadius: 6 }, paperActions: { flexDirection: 'row', gap: 12 }, tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 69, paddingHorizontal: 6, paddingTop: 7, flexDirection: 'row', backgroundColor: '#0E221D', borderTopWidth: 1, borderColor: colors.border }, tabButton: { flex: 1, alignItems: 'center', gap: 3 }, tabLabel: { color: colors.mutedDeep, fontSize: 8 }, tabLabelActive: { color: colors.gold }
});
