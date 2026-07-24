/// features/voice_selection/widgets/voice_list_skeleton.dart
///
/// Shimmering placeholder rows shown while the voice list is loading.
/// Pure presentation widget - no dependencies outside this feature.
library;

import 'package:flutter/material.dart';

import '../presentation/voice_selection_theme.dart';

class VoiceListSkeleton extends StatefulWidget {
  final int itemCount;
  const VoiceListSkeleton({super.key, this.itemCount = 6});

  @override
  State<VoiceListSkeleton> createState() => _VoiceListSkeletonState();
}

class _VoiceListSkeletonState extends State<VoiceListSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1400),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(20),
      itemCount: widget.itemCount,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) => AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          final t = _controller.value;
          final opacity = 0.35 + 0.25 * (0.5 + 0.5 * (t * 2 - 1).abs() * -1 + 0.5);
          return Container(
            height: 76,
            decoration: BoxDecoration(
              color: VoiceTheme.surfaceRaised.withValues(alpha: opacity.clamp(0.35, 0.6)),
              borderRadius: BorderRadius.circular(VoiceTheme.radius),
              border: Border.all(color: VoiceTheme.border),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: VoiceTheme.border,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 12,
                        width: 120,
                        color: VoiceTheme.border,
                      ),
                      const SizedBox(height: 8),
                      Container(
                        height: 10,
                        width: 180,
                        color: VoiceTheme.border.withValues(alpha: 0.6),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
