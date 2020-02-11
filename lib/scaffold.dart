import 'package:flutter/material.dart';
import 'package:portfolio/data.dart';

class App extends StatelessWidget {
  const App({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) => MaterialApp(home: const LayoutScaffold());
}

class LayoutScaffold extends StatelessWidget {
  const LayoutScaffold({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Row(
        children: <Widget>[for (final image in portfolioData.icons.values) Image(image: image)],
      );
}
