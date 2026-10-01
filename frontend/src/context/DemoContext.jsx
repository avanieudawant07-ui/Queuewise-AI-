import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../api/client";

const DemoContext = createContext();

export function DemoProvider({ children }) {
  const [runs, setRuns] = useState([]);
  const [activeRun, setActiveRun] = useState(null);
  const [activeRunSteps, setActiveRunSteps] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingOffers, setPendingOffers] = useState([]);
  const [forceLLMFailure, setForceLLMFailure] = useState(false);
  const [metrics, setMetrics] = useState({ totalRuns: 0, completedRuns: 0, activeRuns: 0, recoverySuccessRate: "100.0" });

  const fetchState = async () => {
    try {
      const [runsRes, approvalsRes, offersRes, metricsRes] = await Promise.all([
        apiClient.get("/agent-runs"),
        apiClient.get("/approvals/pending"),
        apiClient.get("/waitlist/offers/pending"),
        apiClient.get("/agent-runs/metrics/summary")
      ]);

      setRuns(runsRes.data.runs || []);
      setPendingApprovals(approvalsRes.data.approvals || []);
      setPendingOffers(offersRes.data.offers || []);
      setMetrics(metricsRes.data.metrics || metrics);

      // Pick latest active run or most recent run
      const latestRun = runsRes.data.runs?.[0];
      if (latestRun) {
        const stepsRes = await apiClient.get(`/agent-runs/${latestRun.runId}`);
        setActiveRun(stepsRes.data.run);
        setActiveRunSteps(stepsRes.data.steps || []);
      }
    } catch (err) {
      console.error("Error polling demo state:", err);
    }
  };

  useEffect(() => {
    fetchState();
    // Adaptive polling: 2s if any active run, else 6s
    const hasActive = runs.some(r => ["running", "waiting_for_approval", "waiting_for_patient"].includes(r.status));
    const intervalTime = hasActive ? 2000 : 6000;

    const timer = setInterval(fetchState, intervalTime);
    return () => clearInterval(timer);
  }, [runs.map(r => r.status).join(",")]);

  const triggerDemoCancellation = async (appointmentId = null) => {
    const { data } = await apiClient.post("/demo/trigger-cancel", { appointmentId });
    await fetchState();
    return data;
  };

  const simulatePatientResponse = async (response = "ACCEPT", offerId = null) => {
    const { data } = await apiClient.post("/demo/simulate-patient-response", { response, offerId });
    await fetchState();
    return data;
  };

  const toggleLLMFailureMode = async () => {
    const { data } = await apiClient.post("/demo/toggle-llm-failure");
    setForceLLMFailure(data.forceLLMFailure);
    await fetchState();
    return data;
  };

  const resetDemo = async () => {
    const { data } = await apiClient.post("/demo/reset");
    await fetchState();
    return data;
  };

  const decideApproval = async (approvalId, decision) => {
    const { data } = await apiClient.post(`/approvals/${approvalId}/decide`, { decision });
    await fetchState();
    return data;
  };

  return (
    <DemoContext.Provider value={{
      runs,
      activeRun,
      activeRunSteps,
      pendingApprovals,
      pendingOffers,
      forceLLMFailure,
      metrics,
      triggerDemoCancellation,
      simulatePatientResponse,
      toggleLLMFailureMode,
      resetDemo,
      decideApproval,
      refreshState: fetchState
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => useContext(DemoContext);
