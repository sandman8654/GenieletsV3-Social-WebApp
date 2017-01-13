<?php
ini_set('display_errors', 1);
ini_set('log_errors', 0);

$videos = json_decode(rawurldecode($_GET['msvideos']), true);
$cover = @$_GET['mscover'];
?>
<!DOCTYPE html>
<html lang="en-us">
	<head>
		<script src="js/jquery.js"></script>
		<script src="mediaelementjs/mediaelement-and-player.min.js"></script>
		<link rel="stylesheet" href="mediaelementjs/mediaelementplayer.min.css" />
		<style>
			html, body {
				padding: 0;
				margin: 0;
				overflow: hidden;
			}
		</style>
	</head>
	<body>
		<video width="100%" height="100%" preload="preload" autoplay="autoplay" controls="controls" id="player"<?php if($cover) { ?> poster="<?php echo $cover; ?>"<?php } ?>>
<?php
	$forfallback = "";
	foreach($videos as $video) {
		if ($video['type'] == 'video/mp4') {
			$forfallback = $video['src'];
		}
?>
			<source type="<?php echo $video['type']; ?>" src="<?php echo $video['src']; ?>" />
<?php
	}
	
	if ($forfallback) {
?>
			<!-- Flash fallback for non-HTML5 browsers without JavaScript -->
			<object width="320" height="240" type="application/x-shockwave-flash" data="mediaelementjs/flashmediaelement.swf">
				<param name="movie" value="mediaelementjs/flashmediaelement.swf" />
				<param name="flashvars" value="controls=true&file=<?php echo $forfallback; ?>" />
			</object>
<?php
	}
?>
		</video>
		<script>
			new MediaElementPlayer('#player', {
				enableAutosize: true
			});
		</script>
	</body>
</html>