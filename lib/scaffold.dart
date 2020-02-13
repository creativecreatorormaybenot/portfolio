import 'package:flutter/material.dart';
import 'package:portfolio/card.dart';
import 'package:portfolio/data.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class App extends StatelessWidget {
  const App({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData.light().copyWith(iconTheme: IconThemeData(size: 24)),
      home: Provider(
        create: (context) => portfolioData,
        child: const LayoutScaffold(),
      ),
    );
  }
}

class LayoutScaffold extends StatelessWidget {
  const LayoutScaffold({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Row(
        textDirection: TextDirection.rtl,
        children: <Widget>[
          Flexible(
            flex: 13,
            fit: FlexFit.tight,
            child: Material(
              child: GridView(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2),
                children: <Widget>[for (final project in PortfolioData.of(context).projects) ProjectCard(project)],
              ),
            ),
          ),
          Flexible(
            flex: 4,
            fit: FlexFit.tight,
            child: Material(
              elevation: 8,
              color: Theme.of(context).primaryColor,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: ClipOval(
                      child: Image(image: AssetImage('assets/avatar.png')),
                    ),
                  ),
                  Column(
                    // The socials are wrapped in another column in order to align all of them at a common start point.
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      for (final social in Provider.of<PortfolioData>(context).socials) SocialTile(social),
                    ],
                  )
                  // todo filters
                ],
              ),
            ),
          ),
        ],
      );
}

class SocialTile extends StatelessWidget {
  final Social social;

  const SocialTile(this.social, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Tooltip(
        message: '${social.tag} on ${social.site}',
        child: InkWell(
          onTap: () => launch(social.url),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Text(social.tag, style: TextStyle(color: Colors.grey[200])),
              Padding(padding: const EdgeInsets.all(4), child: SiteIcon(social.site)),
            ],
          ),
        ),
      );
}
