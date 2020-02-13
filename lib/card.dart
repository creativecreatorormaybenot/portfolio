import 'package:flutter/material.dart';
import 'package:portfolio/data.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class ProjectCard extends StatelessWidget {
  final Project project;

  const ProjectCard(this.project, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Card(
        child: Column(
          children: <Widget>[
            SelectableText(
              project.title,
              style: Theme.of(context).textTheme.headline5,
            ),
            SelectableText(project.description),
            Row(
              children: <Widget>[
                for (final link in project.links) LinkIconButton(link),
              ],
            )
          ],
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
          child: SiteIcon(link.site),
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
