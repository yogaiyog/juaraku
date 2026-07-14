## Aiming arrows

Start by creating an arrow that moves around the screen.

--- task ---

Open the Scratch starter project [rpf.io/archeryon](https://rpf.io/archeryon){:target="_blank"}.

--- /task ---

In the starter project, you should see a target backdrop and a cross hair sprite.

![starter projects](images/archery-starter.png)


--- task ---

When your game starts, broadcast a message to create a new arrow.

```blocks3
when green flag clicked
broadcast (new arrow v)
```

--- /task ---

--- task ---

Once this message has been received, set the arrow's position and size.

```blocks3
when I receive [new arrow v]
go to x: (-150) y: (-150)
set size to (400) %
```

--- /task ---

--- task ---

Click the green flag to test your game. You should see your arrow move to the bottom-left of the stage and get bigger.

![larger target sprite in bottom left of stage](images/archery-start-test.png)

--- /task ---

--- task ---

Add code to your arrow so that it `glides`{:class="block3motion"} randomly around the stage `forever`{:class="block3control"}.

```blocks3
when I receive [new arrow v]
go to x: (-150) y: (-150)
set size to (400) %
+forever
glide (0.5) secs to x: (pick random (-150) to (150)) y: (pick random (-150) to (150))
end
```

--- /task ---

--- task ---

Test your game again, and you should see your arrow move randomly around the stage.

--- /task ---
