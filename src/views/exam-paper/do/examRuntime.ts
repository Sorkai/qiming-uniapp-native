export interface PendingExamAnswer<T> {
  questionId: number;
  answer: T;
  revision: number;
}

export class ExamAnswerRetryQueue<T> {
  private readonly revisions = new Map<number, number>();
  private readonly pending = new Map<number, PendingExamAnswer<T>>();

  nextRevision(questionId: number): number {
    const revision = (this.revisions.get(questionId) || 0) + 1;
    this.revisions.set(questionId, revision);
    return revision;
  }

  enqueue(item: PendingExamAnswer<T>): void {
    const current = this.pending.get(item.questionId);
    if (current && current.revision > item.revision) return;

    this.revisions.set(
      item.questionId,
      Math.max(this.revisions.get(item.questionId) || 0, item.revision)
    );
    this.pending.set(item.questionId, { ...item });
  }

  acknowledge(questionId: number, revision: number): void {
    const current = this.pending.get(questionId);
    if (current && current.revision <= revision) {
      this.pending.delete(questionId);
    }
  }

  acknowledgeBatch(items: PendingExamAnswer<T>[]): void {
    items.forEach(item => this.acknowledge(item.questionId, item.revision));
  }

  restore(items: PendingExamAnswer<T>[]): void {
    items.forEach(item => {
      if (
        Number.isInteger(item.questionId) &&
        item.questionId > 0 &&
        Number.isInteger(item.revision) &&
        item.revision > 0
      ) {
        this.enqueue(item);
      }
    });
  }

  snapshot(): PendingExamAnswer<T>[] {
    return Array.from(this.pending.values())
      .map(item => ({ ...item }))
      .sort((left, right) => left.questionId - right.questionId);
  }

  clear(): void {
    this.pending.clear();
    this.revisions.clear();
  }

  get size(): number {
    return this.pending.size;
  }
}

export const getAnswerRetryDelay = (failureCount: number): number => {
  const normalizedCount = Math.max(0, Math.floor(failureCount));
  return Math.min(1000 * 2 ** normalizedCount, 30000);
};

export interface ExamDeadlineClock {
  deadlineServerTime: number;
  serverOffset: number;
}

export const createExamDeadlineClock = (
  remainingSeconds: number,
  serverTime: number,
  localTime: number
): ExamDeadlineClock => {
  const safeRemaining = Math.max(0, Math.floor(remainingSeconds));
  const safeLocalTime = Number.isFinite(localTime) ? localTime : Date.now();
  const safeServerTime = Number.isFinite(serverTime)
    ? serverTime
    : safeLocalTime;
  return {
    deadlineServerTime: safeServerTime + safeRemaining * 1000,
    serverOffset: safeServerTime - safeLocalTime
  };
};

export const getExamRemainingSeconds = (
  clock: ExamDeadlineClock,
  localTime: number
): number => {
  const estimatedServerTime = localTime + clock.serverOffset;
  return Math.max(
    0,
    Math.ceil((clock.deadlineServerTime - estimatedServerTime) / 1000)
  );
};

export const updateExamServerOffset = (
  clock: ExamDeadlineClock,
  serverTime: number,
  localTime: number
): ExamDeadlineClock => ({
  deadlineServerTime: clock.deadlineServerTime,
  serverOffset: serverTime - localTime
});
