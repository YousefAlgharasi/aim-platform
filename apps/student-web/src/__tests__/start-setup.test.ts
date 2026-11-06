import { fetchSetupStatus } from '../features/start/setupStatus';
import { studyPlanApi } from '../features/learner/learnerApi';
import * as placementApi from '../features/placement/placementApi';

jest.mock('../features/learner/learnerApi', () => ({ studyPlanApi: { get: jest.fn() } }));
jest.mock('../features/placement/placementApi', () => ({ fetchPlacementGate: jest.fn(), fetchLatestPlacementStatus: jest.fn() }));

const plan = studyPlanApi.get as jest.Mock;
const gate = placementApi.fetchPlacementGate as jest.Mock;
const latest = placementApi.fetchLatestPlacementStatus as jest.Mock;
const planned = { plan: { goal: 'work' } };

describe('fetchSetupStatus (server-side setup state)', () => {
  it('needs the questions and the choice for a brand-new student', async () => {
    plan.mockResolvedValue({ plan: null });
    gate.mockResolvedValue({ should_show_gate: true, decision: null });
    expect(await fetchSetupStatus()).toEqual({ needsPlan: true, needsChoice: true, needsPlacement: false });
  });
  it('resumes at the choice when the plan already exists', async () => {
    plan.mockResolvedValue(planned);
    gate.mockResolvedValue({ should_show_gate: true, decision: null });
    expect(await fetchSetupStatus()).toMatchObject({ needsPlan: false, needsChoice: true });
  });
  it('start from zero unlocks the dashboard without a test', async () => {
    plan.mockResolvedValue(planned);
    gate.mockResolvedValue({ should_show_gate: false, decision: 'start_from_scratch' });
    expect(await fetchSetupStatus()).toEqual({ needsPlan: false, needsChoice: false, needsPlacement: false });
  });
  it.each(['none', 'active', 'submitted'])('keeps the dashboard locked while the placement test is %s', async (status) => {
    plan.mockResolvedValue(planned);
    gate.mockResolvedValue({ should_show_gate: false, decision: 'take_placement' });
    latest.mockResolvedValue({ status });
    expect(await fetchSetupStatus()).toEqual({ needsPlan: false, needsChoice: false, needsPlacement: true });
  });
  it('unlocks once the placement test is completed', async () => {
    plan.mockResolvedValue(planned);
    gate.mockResolvedValue({ should_show_gate: false, decision: 'take_placement' });
    latest.mockResolvedValue({ status: 'completed' });
    expect((await fetchSetupStatus()).needsPlacement).toBe(false);
  });
  it('never locks the student out when a check fails', async () => {
    plan.mockRejectedValue(new Error('down'));
    gate.mockRejectedValue(new Error('down'));
    expect(await fetchSetupStatus()).toEqual({ needsPlan: false, needsChoice: false, needsPlacement: false });
    plan.mockResolvedValue(planned);
    gate.mockResolvedValue({ should_show_gate: false, decision: 'take_placement' });
    latest.mockRejectedValue(new Error('down'));
    expect((await fetchSetupStatus()).needsPlacement).toBe(false);
  });
});
