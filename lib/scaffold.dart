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
  Widget build(BuildContext context) => Material(
        color: Theme.of(context).primaryColor,
        child: Row(
          children: <Widget>[
            for (final image in portfolioData.icons.values)
              ClipOval(
                child: Container(
                  color: Theme.of(context).cardColor,
                  child: Image(
                    image: image,
                    width: 64,
                    height: 64,
                  ),
                ),
              )
          ],
        ),
      );
}
