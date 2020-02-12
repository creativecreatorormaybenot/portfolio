import 'package:flutter/material.dart';
import 'package:portfolio/card.dart';
import 'package:portfolio/data.dart';
import 'package:provider/provider.dart';

class App extends StatefulWidget {
  const App({Key key}) : super(key: key);

  @override
  _AppState createState() => _AppState();
}

class _AppState extends State<App> {
  PortfolioData data;

  @override
  void initState() {
    super.initState();

    data = portfolioData;
  }

  @override
  Widget build(BuildContext context) => MaterialApp(
        home: Provider.value(
          value: data,
          child: const LayoutScaffold(),
        ),
      );
}

class LayoutScaffold extends StatelessWidget {
  const LayoutScaffold({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Material(
        color: Theme.of(context).primaryColor,
        child: Row(
          children: <Widget>[
            LinkIconButton(link: Link('GitHub', 'url', '')),
          ],
        ),
      );
}
