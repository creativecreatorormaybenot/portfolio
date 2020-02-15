import 'package:flutter/material.dart';
import 'package:portfolio/data.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class ProjectCard extends StatelessWidget {
  final Project project;

  const ProjectCard(this.project, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) => PhysicalModel(
        elevation: 4,
        borderRadius: BorderRadius.circular(8),
        color: Colors.transparent,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Material(
            color: Theme.of(context).cardColor,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              // This centers the title.
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: SelectableText(
                    project.title,
                    style: Theme.of(context).textTheme.headline5,
                    textAlign: TextAlign.center,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 8, right: 4, left: 6),
                  child: SizedBox(
                    // This allows to align the text at start if it does not fill the whole width.
                    width: double.infinity,
                    child: SelectableText(project.description),
                  ),
                ),
                Divider(),
                SizedBox(
                  // This allows to align the wrap at start.
                  width: double.infinity,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 8, left: 8, right: 4),
                    child: Wrap(
                      children: <Widget>[for (final tag in project.tags) Tag(tag)],
                    ),
                  ),
                ),
                SizedBox(
                  width: double.infinity,
                  child: Material(
                    // The Material is needed to apply the splashes from the LinkIconButton's.
                    color: Theme.of(context).primaryColorLight,
                    child: Padding(
                      padding: const EdgeInsets.all(4),
                      child: Wrap(
                        children: <Widget>[for (final link in project.links) LinkIconButton(link)],
                      ),
                    ),
                  ),
                )
              ],
            ),
          ),
        ),
      );
}

class LinkIconButton extends StatelessWidget {
  final Link link;

  const LinkIconButton(this.link, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Tooltip(
        message: link.hint ?? link.site,
        child: InkResponse(
          onTap: () {
            launch(link.url);
          },
          child: Padding(
            padding: const EdgeInsets.only(top: 3, bottom: 3, right: 4, left: 2),
            child: SiteIcon(link.site),
          ),
        ),
      );
}

class SiteIcon extends StatelessWidget {
  final String site;

  const SiteIcon(this.site, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final iconSize = Theme.of(context).iconTheme.size;

    return ClipOval(
      child: Container(
        color: Theme.of(context).cardColor,
        child: SizedBox(
          width: iconSize,
          height: iconSize,
          child: OverflowBox(
            // The overflow of .7 pixels in both axes (.35 on each side) removes some white artifacts that are caused by some
            // round icons that were clipped a tiny bit differently than ClipOval clips, i.e. the size of the circle is off by a few pixels.
            maxWidth: iconSize + .7,
            maxHeight: iconSize + .7,
            child: Image(image: Provider.of<PortfolioData>(context).icons[site]),
          ),
        ),
      ),
    );
  }
}

class Tag extends StatelessWidget {
  final String tag;

  const Tag(this.tag, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dotSize = Theme.of(context).iconTheme.size / 4;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        children: <Widget>[
          Container(
            width: dotSize,
            height: dotSize,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: PortfolioData.of(context).colors[tag],
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 4, right: 8),
            child: Text(tag),
          ),
        ],
      ),
    );
  }
}
