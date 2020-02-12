import 'package:flutter/material.dart';
import 'package:portfolio/data.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class ProjectCard extends StatelessWidget {
  final Project project;

  const ProjectCard({
    Key key,
    this.project,
  }) : super(key: key);

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
                for (final link in project.links) LinkIconButton(link: link),
              ],
            )
          ],
        ),
      );
}

class LinkIconButton extends StatelessWidget {
  final Link link;

  const LinkIconButton({
    Key key,
    this.link,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) => Tooltip(
        message: link.hint ?? link.type,
        child: InkResponse(
          onTap: () {
            launch(link.url);
          },
          child: ClipOval(
            child: Container(
              color: Theme.of(context).cardColor,
              child: Image(
                image: Provider.of<PortfolioData>(context).icons[link.type],
                width: 24,
                height: 24,
              ),
            ),
          ),
        ),
      );
}
