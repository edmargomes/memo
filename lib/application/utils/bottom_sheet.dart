import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:layoutr/common_layout.dart';
import 'package:memo/application/constants/dimensions.dart' as dimens;
import 'package:memo/application/theme/theme_controller.dart';

class _DragIndicator extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ref.watch(themeController);

    return Container(
      width: dimens.dragIndicatorWidth,
      height: dimens.dragIndicatorHeight,
      decoration: BoxDecoration(
        color: theme.neutralSwatch.shade700,
        borderRadius: dimens.genericRoundedElementBorderRadius,
      ),
    );
  }
}

/// Wraps a [showModalBottomSheet] behavior that snaps its content based on [child] size
///
/// If [isDismissible] is `false`, all drag interactions are disabled and the caller must handle its dismissal directly.
/// Also, no dragIndicator is drawn.
Future<T?> showSnappableDraggableModalBottomSheet<T>(
  BuildContext context, {
  required Widget child,
  bool isDismissible = true,
  Color? backgroundColor,
  String? title,
}) {
  final header = Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      if (isDismissible) Center(child: _DragIndicator().withSymmetricalPadding(context, vertical: Spacing.small)),
      if (title != null)
        Text(
          title,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headline6,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ).withSymmetricalPadding(context, vertical: Spacing.small, horizontal: Spacing.medium)
    ],
  );

  return showModalBottomSheet<T>(
    context: context,
    isDismissible: isDismissible,
    enableDrag: isDismissible,
    isScrollControlled: true,
    builder: (context) {
      return ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: context.deviceHeight * 0.9,
          minHeight: dimens.minBottomSheetHeight,
        ),
        child: Container(
          color: backgroundColor,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              header,
              Flexible(child: SafeArea(child: child)),
            ],
          ),
        ),
      );
    },
  );
}
