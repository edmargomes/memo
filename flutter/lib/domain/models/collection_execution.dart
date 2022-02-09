import 'package:memo/domain/enums/memo_difficulty.dart';
import 'package:memo/domain/models/memo_executions_metadata.dart';

typedef MemoId = String;

class CollectionExecution extends MemoExecutionsMetadata {
  CollectionExecution({
    required this.id,
    required this.executions,
    required this.isPrivate,
    required int timeSpentInMillis,
    required DifficultyMap difficulties,
  })  : assert(executions.isNotEmpty, 'Requires memos executions'),
        super(timeSpentInMillis, difficulties);

  final String id;
  final Map<MemoId, MemoExecutionRecallMetadata> executions;

  int get totalMemos => executions.entries.length;
  int get uniqueExecutedMemos => executions.values.where((exec) => !exec.isPristine).length;

  /// `true` if this parent `Collection` is private to its owner `User`.
  final bool isPrivate;

  /// `true` if not a single `Memo` have been executed.
  bool get isPristine => uniqueExecutedMemos == 0;

  /// `true` if all `Memo` have been executed at least once.
  bool get isCompleted => totalMemos == uniqueExecutedMemos;

  @override
  List<Object?> get props => [id, executions, ...super.props];

  CollectionExecution copyWith({
    required Map<MemoId, MemoExecutionRecallMetadata> executions,
    required int timeSpentInMillis,
    required DifficultyMap difficulties,
  }) =>
      CollectionExecution(
        id: id,
        executions: executions,
        isPrivate: isPrivate,
        timeSpentInMillis: timeSpentInMillis,
        difficulties: difficulties,
      );
}

class MemoExecutionRecallMetadata {
  MemoExecutionRecallMetadata({
    required this.id,
    required this.totalExecutions,
    required this.lastExecution,
    required this.lastMarkedDifficulty,
  }) : assert(
          (lastExecution != null && lastMarkedDifficulty != null && totalExecutions > 0) ^
              (lastExecution == null && lastMarkedDifficulty == null && totalExecutions == 0),
          'Inconsistency between one or multiple execution-related properties, as they must be mutually exclusive',
        );

  MemoExecutionRecallMetadata.blank({required this.id})
      : totalExecutions = 0,
        lastExecution = null,
        lastMarkedDifficulty = null;

  final String id;

  /// `true` if this `Memo` was never executed.
  bool get isPristine => lastExecution != null;

  final int totalExecutions;
  final DateTime? lastExecution;
  final MemoDifficulty? lastMarkedDifficulty;

  MemoExecutionRecallMetadata copyWith({
    required int totalExecutions,
    required DateTime lastExecution,
    required MemoDifficulty lastMarkedDifficulty,
  }) =>
      MemoExecutionRecallMetadata(
        id: id,
        totalExecutions: totalExecutions,
        lastExecution: lastExecution,
        lastMarkedDifficulty: lastMarkedDifficulty,
      );
}