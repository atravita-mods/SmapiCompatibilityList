This repository has the compatibility metadata for every [Stardew Valley][] C# mod for [SMAPI][].
The [mod compatibility list][] is automatically generated from this data.

## Contents
* [For players](#for-players)
* [For mod authors](#for-mod-authors)
  * [Update your own mod](#update-your-own-mod)
  * [Unofficial updates](#unofficial-updates)
* [Edit the compatibility list](#edit-the-compatibility-list)
  * [Guidelines](#guidelines)
  * [Propose changes](#propose-changes)
  * [Publish changes](#publish-changes)
  * [Validate changes locally](#validate-changes-locally)

## For players
See the [mod compatibility list][] instead!

## For mod authors
### Update your own mod
See [migration guides][] on the wiki.

You can also...
* [Update this compatibility list](#edit-the-compatibility-list).
* Chat or ask questions in [#making-mods-general on Discord](https://smapi.io/community#Discord).

### Unofficial updates
An _unofficial update_ is an update for a broken open-source mod which is available from somewhere
other than the official mod page. (This is separate from a continuation or redux mod.)

SMAPI has special support for unofficial updates. If the player has the official mod installed
_and_ it's incompatible, SMAPI will automatically show an update alert so they can get the
unofficial update.

To prepare an unofficial update:

1. [Fork the mod's code](https://help.github.com/articles/fork-a-repo/).
2. Make your changes to that fork.
3. Change the version in `manifest.json` to an unofficial version.

   **⚠ Important**: An unofficial version _must_ match the official mod's version, incremented by
   `0.0.1`, with `-unofficial.1-yourName` appended. For example, if the official mod version is
   `1.2.3`, then the unofficial versions would be `1.2.4-unofficial.1-yourName`,
   `1.2.4-unofficial.2-yourName`, etc. This avoids breaking update alerts for the official mod
    versions.

4. Push your changes to GitHub.
5. Post a release zip in the [unofficial updates forum thread][] with a link to your fork on GitHub.  
   _(If the mod uses the NuGet build package, there should be a release package named `<mod name>
   <version>.zip` in your bin folder.)_
6. [Submit a pull request][] to the original author (if applicable).

## Edit the compatibility list
Contributions are welcome!

### Guidelines
Before proposing changes, please be aware of these guidelines:

- **Don't add XNB mods.**  
  See [Modding:Using XNB mods][] on the wiki instead.
- **Don't add compatible content packs.**  
  This primarily lists C# SMAPI mods. However, broken content packs can still be listed in the
  `brokenContentPacks` field.
- **Don't mark most mods 'abandoned' or 'obsolete'.**  
  A mod is only considered 'abandoned' or 'obsolete' if (a) the mod author has explicitly abandoned
  the mod, or (b) they've hidden or deleted the mod page, or (c) it's been superseded by an
  equivalent game feature. A mod is not considered abandoned just because it hasn't been updated
  for a while.
- **Don't mark a mod 'broken' due to regular bugs.**  
  Only mark a mod 'broken' if it's incompatible. This isn't the place to track general mod bugs,
  unless they impact compatibility. In rare cases where a non-compatibility bug is severe enough to
  note here (e.g. game crashes on some platforms), you can use the `warnings` field.
- All contributions are released under this [repo's open-source MIT license](LICENSE).

### Propose changes
To update this list:

1. Navigate to `data/data.jsonc` in the GitHub web UI.
2. Click the "Edit this file" icon in the top-right corner.
3. Copy the text into a text editor like [Visual Studio Code][] that understands JSON schemas.
4. Make any changes needed.

   You can point at a field for an explanation of that field. For example:
   ![](docs/schema-tooltip.png)
5. Copy your changes back into the GitHub web UI, and click the big green button to propose the changes.

### Publish changes
The public [mod compatibility list][] will be updated automatically within 10 minutes once the
proposed change is merged.

### Validate changes locally
> [!NOTE]  
> **You usually don't need to do this.** The data is validated automatically when you commit or
> post a pull request.

Here's how to validate the data locally if needed.

1. First-time setup:
   1. Install [Docker](https://www.docker.com/) and [Node.js](https://nodejs.org).
   2. On Windows, [check the PowerShell version](https://stackoverflow.com/a/1825807/262123) and
      [update to PowerShell 7 or later](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows) if needed.  
      _(This fixes encoding errors due to older versions writing UTF-16 files.)_
2. From a terminal in the repo folder, run these commands:
   ```sh
   # strip comments
   npm install strip-json-comments-cli
   npx strip-json-comments-cli data/data.jsonc > data/data.json

   # validate JSON schema
   docker run --rm -v "$(pwd):/github/workspace" -e GITHUB_WORKSPACE=/github/workspace -e INPUT_SCHEMA=/data/schema.json -e INPUT_JSONS=/data/data.json orrosenblatt/validate-json-action:latest
   ```

[migration guides]: https://stardewvalleywiki.com/Modding:Index#Migration_guides
[Modding:Using XNB mods]: https://stardewvalleywiki.com/Modding:Using_XNB_mods
[Submit a pull request]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[unofficial updates forum thread]: https://forums.stardewvalley.net/threads/unofficial-mod-updates.2096/

[mod compatibility list]: https://smapi.io/mods

[SMAPI]: https://github.com/Pathoschild/SMAPI
[Stardew Valley]: https://www.stardewvalley.net
[Visual Studio Code]: https://code.visualstudio.com/
