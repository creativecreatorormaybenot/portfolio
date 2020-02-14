import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:portfolio/card.dart';
import 'package:portfolio/data.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class App extends StatelessWidget {
  const App({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData.light().copyWith(
        iconTheme: IconThemeData(size: 24),
        primaryColor: const Color(0xff444444),
        primaryColorLight: const Color(0xff777777),
        primaryColorDark: const Color(0xff111111),
        accentColor: const Color(0xff999999),
        backgroundColor: const Color(0xff333333),
      ),
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
        // The items are ordered in reverse so that the elevation from the material of the left section can draw a shadow.
        textDirection: TextDirection.rtl,
        children: <Widget>[
          Flexible(
            flex: 11,
            fit: FlexFit.tight,
            child: Material(
              color: Theme.of(context).backgroundColor,
              child: StaggeredGridView.countBuilder(
                padding: const EdgeInsets.all(16),
                crossAxisCount: 2,
                itemCount: PortfolioData.of(context).projects.length,
                mainAxisSpacing: 12,
                crossAxisSpacing: 14,
                staggeredTileBuilder: (int index) => StaggeredTile.fit(1),
                itemBuilder: (context, index) => ProjectCard(PortfolioData.of(context).projects[index]),
              ),
            ),
          ),
          Flexible(
            flex: 3,
            fit: FlexFit.tight,
            child: Material(
              elevation: 8,
              color: Theme.of(context).primaryColor,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.all(32),
                    child: PhysicalModel(
                      shape: BoxShape.circle,
                      elevation: 4,
                      color: Colors.transparent,
                      child: ClipOval(
                        child: Image(image: AssetImage('assets/avatar.png')),
                      ),
                    ),
                  ),
                  Card(
                    color: Theme.of(context).primaryColorLight,
                    elevation: 1,
                    child: Padding(
                      padding: const EdgeInsets.all(4),
                      child: Column(
                        // The socials are wrapped in another column in order to align all of them at a common start point.
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          for (final social in Provider.of<PortfolioData>(context).socials) SocialTile(social),
                        ],
                      ),
                    ),
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
          child: Padding(
            padding: const EdgeInsets.only(top: 3, bottom: 3, left: 5),
            child: Wrap(
              direction: Axis.horizontal,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: <Widget>[
                Text(social.tag, style: TextStyle(color: ThemeData.dark().textTheme.bodyText2.color)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 5),
                  child: SiteIcon(social.site),
                ),
              ],
            ),
          ),
        ),
      );
}
