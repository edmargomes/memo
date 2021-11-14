import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:layoutr/common_layout.dart';
import 'package:memo/application/constants/dimensions.dart' as dimens;
import 'package:memo/application/theme/theme_controller.dart';

/// Wraps a [showModalBottomSheet] behavior that snaps its content based on [child] size
///
/// If [isDismissible] is `false`, all drag interactions are disabled and the caller must handle its dismissal directly.
/// Also, no dragIndicator is drawn.
Future<T?> showSnappableDraggableModalBottomSheet<T>(
  BuildContext context,
  WidgetRef ref, {
  required Widget child,
  bool isDismissible = true,
  Color? backgroundColor,
  String? title,
}) {
  final dragIndicator = Container(
    width: dimens.dragIndicatorWidth,
    height: dimens.dragIndicatorHeight,
    decoration: BoxDecoration(
      color: ref.read(themeController).neutralSwatch.shade700,
      borderRadius: dimens.genericRoundedElementBorderRadius,
    ),
  ).withSymmetricalPadding(context, vertical: Spacing.small);

  final header = Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      if (isDismissible) Center(child: dragIndicator),
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
