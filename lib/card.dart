import 'package:flutter/material.dart';
import 'package:portfolio/data.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class LinkIconButton extends StatelessWidget {
  final Link link;

  const LinkIconButton({
    Key key,
    this.link,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) => Tooltip(
        message: link.type,
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
