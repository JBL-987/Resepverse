import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const RecipeComments = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Jane Doe</h3>
                <span className="text-sm text-muted-foreground">
                  2 days ago
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                This recipe is amazing! I made it for my family and they loved
                it.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">John Smith</h3>
                <span className="text-sm text-muted-foreground">
                  1 day ago
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                I added a little bit of shrimp paste to the recipe and it
                turned out great!
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Leave a Comment</h3>
          <div className="mt-4 flex flex-col gap-4">
            <Textarea placeholder="Write your comment here..." />
            <Button>Post Comment</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeComments;