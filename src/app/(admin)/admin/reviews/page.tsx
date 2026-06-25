"use client";

import { useState } from "react";
import {
  useGetReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "@/lib/redux/features/reviews/reviewsApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Review } from "@/types/review.types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [adminNote, setAdminNote] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<
    "all" | "approved" | "pending"
  >("all");
  const [ratingFilter, setRatingFilter] = useState<
    "all" | "5" | "4" | "3" | "2" | "1"
  >("all");

  const { data, isLoading, error } = useGetReviewsQuery({
    page,
    limit: 10,
    search: searchQuery || undefined,
    isApproved:
      approvalFilter === "all" ? undefined : approvalFilter === "approved",
    rating: ratingFilter === "all" ? undefined : parseInt(ratingFilter),
  });

  const [updateReview] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const renderReviewImages = (images: string | null) => {
    if (!images) return null;

    try {
      const imageArray = JSON.parse(images);
      if (!Array.isArray(imageArray) || imageArray.length === 0) return null;

      return (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {imageArray.map((url: string, index: number) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border"
            >
              <img
                src={url}
                alt={`Review image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchQuery("");
    setApprovalFilter("all");
    setRatingFilter("all");
    setPage(1);
  };

  const handleApprove = async (id: number, note?: string) => {
    try {
      await updateReview({
        id,
        data: {
          isApproved: true,
          adminNote: note || undefined,
        },
      }).unwrap();
      setAdminNote(""); // Reset note
    } catch (err) {
      console.error("Failed to approve review:", err);
      alert("Failed to approve review");
    }
  };

  const handleReject = async (id: number, note?: string) => {
    try {
      await updateReview({
        id,
        data: {
          isApproved: false,
          adminNote: note || undefined,
        },
      }).unwrap();
      setAdminNote(""); // Reset note
    } catch (err) {
      console.error("Failed to reject review:", err);
      alert("Failed to reject review");
    }
  };

  const openActionModal = (type: "approve" | "reject", review: Review) => {
    setActionType(type);
    setSelectedReview(review);
    setAdminNote(review.adminNote || "");
    setIsModalOpen(false); // Close detail modal if open
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedReview) return;

    if (!adminNote.trim()) {
      alert("Please provide an admin note");
      return;
    }

    if (actionType === "approve") {
      await handleApprove(selectedReview.id, adminNote);
    } else {
      await handleReject(selectedReview.id, adminNote);
    }

    setIsActionModalOpen(false);
    setAdminNote("");
  };

  const handleDelete = async (id: number, productName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete this review for "${productName}"?`,
      )
    ) {
      try {
        await deleteReview(id).unwrap();
        alert("Review deleted successfully!");
      } catch (err) {
        console.error("Failed to delete review:", err);
        alert("Failed to delete review");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-gray-600 mt-1">
            Moderate and manage product reviews
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by product name, user, or review content..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="pl-9"
              />
            </div>

            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            <Select
              value={approvalFilter}
              onValueChange={(value) => {
                setApprovalFilter(value as "all" | "approved" | "pending");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={ratingFilter}
              onValueChange={(value) => {
                setRatingFilter(value as "all" | "5" | "4" | "3" | "2" | "1");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery ||
              approvalFilter !== "all" ||
              ratingFilter !== "all") && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="w-full sm:w-auto"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Reviews</CardTitle>
          <CardDescription>
            {data?.pagination?.total || 0} total reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-primary">Failed to load reviews</p>
            </div>
          ) : !data?.data?.length ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {review.product?.name || "Unknown Product"}
                          </p>
                          {review.isVerifiedPurchase && (
                            <div className="flex items-center gap-1 mt-1">
                              <ShoppingBag className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600">
                                Verified Purchase
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {review.user?.firstName && review.user?.lastName
                              ? `${review.user.firstName} ${review.user.lastName}`
                              : "Anonymous"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {review.user?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {review.rating}/5
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          {review.title && (
                            <p className="font-medium mb-1 line-clamp-1">
                              {review.title}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {review.comment}
                          </p>
                          {/* <button
                            onClick={() => {
                              setSelectedReview(review);
                              setIsModalOpen(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 hover:underline"
                          >
                            Show more
                          </button> */}
                          {review.images && (
                            <p className="text-xs text-gray-500 mt-1">
                              📷 Has {JSON.parse(review.images).length} image(s)
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            className={
                              review.isApproved
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-primary/10 text-primary border-primary/30"
                            }
                          >
                            {review.isApproved ? "Approved" : "Rejected"}
                          </Badge>
                          {review.helpfulCount > 0 && (
                            <span className="text-xs text-gray-500">
                              👍 {review.helpfulCount} helpful
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {formatDate(review.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!review.isApproved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openActionModal("approve", review)}
                              title="Approve Review"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {review.isApproved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openActionModal("reject", review)}
                              title="Reject Review"
                            >
                              <XCircle className="h-4 w-4 text-primary" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Details"
                            onClick={() => {
                              setSelectedReview(review);
                              setIsModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                review.id,
                                review.product?.name || "this product",
                              )
                            }
                            title="Delete Review"
                          >
                            <Trash2 className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination?.total && data.pagination.total > 10 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pagination?.totalPages || 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (data.pagination?.totalPages || 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Review Details
              {selectedReview?.isVerifiedPurchase && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  Verified Purchase
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Review for {selectedReview?.product?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <p className="font-medium">
                    {selectedReview.user?.firstName &&
                    selectedReview.user?.lastName
                      ? `${selectedReview.user.firstName} ${selectedReview.user.lastName}`
                      : "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedReview.user?.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedReview.createdAt)}
                  </p>
                  <Badge
                    className={
                      selectedReview.isApproved
                        ? "bg-green-100 text-green-800 border-green-300 mt-1"
                        : "bg-primary/10 text-primary border-primary/30 mt-1"
                    }
                  >
                    {selectedReview.isApproved ? "Approved" : "Rejected"}
                  </Badge>
                </div>
              </div>

              {/* Rating */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Rating</p>
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm text-gray-600">
                    {selectedReview.rating} out of 5
                  </span>
                </div>
              </div>

              {/* Title */}
              {selectedReview.title && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Title
                  </p>
                  <p className="font-semibold text-lg">
                    {selectedReview.title}
                  </p>
                </div>
              )}

              {/* Comment */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Review</p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedReview.comment}
                </p>
              </div>

              {/* Images */}
              {selectedReview.images && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Photos
                  </p>
                  {renderReviewImages(selectedReview.images)}
                </div>
              )}

              {/* Helpful Count */}
              {selectedReview.helpfulCount > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Helpful Votes
                  </p>
                  <p className="text-gray-700">
                    👍 {selectedReview.helpfulCount} customer
                    {selectedReview.helpfulCount !== 1 ? "s" : ""} found this
                    helpful
                  </p>
                </div>
              )}

              {/* Admin Note */}
              {selectedReview.adminNote && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Admin Note
                  </p>
                  <p className="text-sm text-yellow-700">
                    {selectedReview.adminNote}
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {!selectedReview.isApproved ? (
                  <Button
                    onClick={() => openActionModal("approve", selectedReview)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Review
                  </Button>
                ) : (
                  <Button
                    onClick={() => openActionModal("reject", selectedReview)}
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Review
                  </Button>
                )}
                <Button
                  onClick={() => {
                    handleDelete(
                      selectedReview.id,
                      selectedReview.product?.name || "this product",
                    );
                    setIsModalOpen(false);
                  }}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Admin Note Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Review" : "Reject Review"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This review will be visible to customers"
                : "This review will be hidden from customers"}
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Review Preview */}
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm text-gray-600">
                    {selectedReview.rating}/5
                  </span>
                </div>
                {selectedReview.title && (
                  <p className="font-medium mb-1">{selectedReview.title}</p>
                )}
                <p className="text-sm text-gray-600 line-clamp-3">
                  {selectedReview.comment}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  by {selectedReview.user?.email} on{" "}
                  {selectedReview.product?.name}
                </p>
              </div>

              {/* Admin Note Input */}
              <div>
                <Label htmlFor="adminNote">
                  Admin Note <span className="text-primary">*</span>
                </Label>
                <Textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    actionType === "approve"
                      ? "Add a note explaining why this review was approved..."
                      : "Add a note explaining why this review was rejected..."
                  }
                  rows={4}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This note is for internal use only and won't be visible to
                  customers
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setAdminNote("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  className={`flex-1 ${
                    actionType === "reject" ? "bg-primary hover:bg-primary/80" : ""
                  }`}
                >
                  {actionType === "approve" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
